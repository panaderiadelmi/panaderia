import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/firebase/auth';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { LineaPedido, FranjaRecogida, MetodoPago, TipoIVA } from '@/lib/types';

interface PedidoBody {
  items: {
    productoId: string;
    nombre: string;
    cantidad: number;
  }[];
  franjaRecogida: FranjaRecogida;
  metodoPago: MetodoPago;
  notasCliente?: string;
}

export async function POST(request: NextRequest) {
  try {
    const sesion = await getSession();
    if (!sesion) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body: PedidoBody = await request.json();
    const { items, franjaRecogida, metodoPago, notasCliente } = body;

    if (!items?.length || !franjaRecogida?.fecha || !franjaRecogida?.horaInicio || !metodoPago) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Security: re-fetch prices from Firestore
    const productoIds = Array.from(new Set(items.map(i => i.productoId)));
    if (productoIds.length > 30) {
      return NextResponse.json({ error: 'Demasiados productos distintos' }, { status: 400 });
    }

    const productosSnap = await adminDb
      .collection('productos')
      .where('__name__', 'in', productoIds)
      .get();

    const productosMap = new Map(productosSnap.docs.map(d => [d.id, d.data()]));

    const lineas: LineaPedido[] = [];
    let subtotalSinIVA = 0;
    let ivaTotal = 0;

    for (const item of items) {
      const prod = productosMap.get(item.productoId);
      if (!prod || !prod.disponible) {
        return NextResponse.json(
          { error: `Producto no disponible: ${item.nombre}` },
          { status: 400 },
        );
      }

      const cantidad = Math.max(1, Math.round(item.cantidad));
      const precioSinIVA = prod.precioSinIVA as number;
      const tipoIVA = prod.tipoIVA as TipoIVA;
      const lineSinIVA = Math.round(precioSinIVA * cantidad * 100) / 100;
      const lineIVA    = Math.round(lineSinIVA * tipoIVA * 100) / 100;

      lineas.push({
        productoId: item.productoId,
        nombre:     prod.nombre,
        peso:       prod.peso ?? '',
        cantidad,
        precioSinIVA,
        tipoIVA,
        subtotalSinIVA: lineSinIVA,
        ivaAmount:      lineIVA,
        totalConIVA:    Math.round((lineSinIVA + lineIVA) * 100) / 100,
      });

      subtotalSinIVA += lineSinIVA;
      ivaTotal       += lineIVA;
    }

    subtotalSinIVA = Math.round(subtotalSinIVA * 100) / 100;
    ivaTotal       = Math.round(ivaTotal * 100) / 100;
    const totalConIVA = Math.round((subtotalSinIVA + ivaTotal) * 100) / 100;

    // Atomic order number generation
    const counterRef = adminDb.collection('counters').doc('pedidos');
    const anio = new Date().getFullYear();

    const numero = await adminDb.runTransaction(async t => {
      const counter = await t.get(counterRef);
      const next = counter.exists ? (counter.data()!.value as number) + 1 : 1;
      t.set(counterRef, { value: next });
      return `SG-${anio}-${String(next).padStart(4, '0')}`;
    });

    // Client info (phone)
    const clienteDoc = await adminDb.collection('clientes').doc(sesion.uid).get();
    const clienteTelefono = (clienteDoc.data()?.telefono as string) ?? '';

    const pedidoRef = await adminDb.collection('pedidos').add({
      numero,
      clienteId:       sesion.uid,
      clienteNombre:   `${sesion.nombre} ${sesion.apellidos}`.trim(),
      clienteEmail:    sesion.email,
      clienteTelefono,
      lineas,
      subtotalSinIVA,
      ivaTotal,
      totalConIVA,
      estado:          'pendiente',
      franjaRecogida,
      metodoPago,
      notasCliente:    notasCliente ?? '',
      createdAt:       FieldValue.serverTimestamp(),
      updatedAt:       FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ pedidoId: pedidoRef.id, numero });
  } catch (err) {
    console.error('[POST /api/pedidos]', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
