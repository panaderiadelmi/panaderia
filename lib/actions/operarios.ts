'use server';

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { CategoriaOperario, TipoContrato, TipoHoras } from '@/lib/types';

// ── Operarios ─────────────────────────────────────────────────────────────────

export async function crearOperario(formData: FormData) {
  const nombre          = (formData.get('nombre')          as string).trim();
  const apellidos       = (formData.get('apellidos')       as string).trim();
  const categoria       = formData.get('categoria')        as CategoriaOperario;
  const telefono        = (formData.get('telefono')        as string).trim();
  const email           = (formData.get('email')           as string).toLowerCase().trim();
  const nss             = (formData.get('nss')             as string).trim();
  const numeroCuenta    = (formData.get('numeroCuenta')    as string).trim().toUpperCase();
  const fechaNacimiento = (formData.get('fechaNacimiento') as string);
  const fechaInicio     = (formData.get('fechaInicio')     as string);
  const tipoContrato    = formData.get('tipoContrato')     as TipoContrato;
  const notas           = ((formData.get('notas')          as string) ?? '').trim();

  await adminDb.collection('operarios').add({
    nombre, apellidos, categoria, telefono, email,
    nss, numeroCuenta, fechaNacimiento, fechaInicio, tipoContrato,
    notas, activo: true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  revalidatePath('/admin/operarios');
  redirect('/admin/operarios?creado=1');
}

export async function actualizarOperario(id: string, formData: FormData) {
  const nombre          = (formData.get('nombre')          as string).trim();
  const apellidos       = (formData.get('apellidos')       as string).trim();
  const categoria       = formData.get('categoria')        as CategoriaOperario;
  const telefono        = (formData.get('telefono')        as string).trim();
  const email           = (formData.get('email')           as string).toLowerCase().trim();
  const nss             = (formData.get('nss')             as string).trim();
  const numeroCuenta    = (formData.get('numeroCuenta')    as string).trim().toUpperCase();
  const fechaNacimiento = (formData.get('fechaNacimiento') as string);
  const fechaInicio     = (formData.get('fechaInicio')     as string);
  const tipoContrato    = formData.get('tipoContrato')     as TipoContrato;
  const activo          = formData.get('activo') === 'true';
  const notas           = ((formData.get('notas')          as string) ?? '').trim();

  await adminDb.collection('operarios').doc(id).update({
    nombre, apellidos, categoria, telefono, email,
    nss, numeroCuenta, fechaNacimiento, fechaInicio, tipoContrato,
    activo, notas,
    updatedAt: FieldValue.serverTimestamp(),
  });

  revalidatePath('/admin/operarios');
  revalidatePath(`/admin/operarios/${id}`);
  redirect(`/admin/operarios/${id}?editado=1`);
}

export async function eliminarOperario(id: string, _fd?: FormData) {
  await adminDb.collection('operarios').doc(id).delete();
  revalidatePath('/admin/operarios');
  redirect('/admin/operarios?eliminado=1');
}

// ── Horarios ──────────────────────────────────────────────────────────────────

export async function crearHorario(formData: FormData) {
  const operarioId    = (formData.get('operarioId')    as string).trim();
  const fecha         = (formData.get('fecha')         as string);
  const horarioInicio = (formData.get('horarioInicio') as string);
  const horarioFin    = (formData.get('horarioFin')    as string);
  const tipoHoras     = formData.get('tipoHoras')      as TipoHoras;
  const horasExtras   = parseFloat(formData.get('horasExtras') as string) || 0;
  const notas         = ((formData.get('notas') as string) ?? '').trim();

  const opSnap = await adminDb.collection('operarios').doc(operarioId).get();
  const opData = opSnap.data() ?? {};
  const operarioNombre = `${opData.nombre ?? ''} ${opData.apellidos ?? ''}`.trim();

  await adminDb.collection('horarios').add({
    operarioId, operarioNombre,
    fecha, horarioInicio, horarioFin, tipoHoras, horasExtras, notas,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  revalidatePath('/admin/horarios');
  redirect('/admin/horarios?creado=1');
}

export async function actualizarHorario(id: string, formData: FormData) {
  const operarioId    = (formData.get('operarioId')    as string).trim();
  const fecha         = (formData.get('fecha')         as string);
  const horarioInicio = (formData.get('horarioInicio') as string);
  const horarioFin    = (formData.get('horarioFin')    as string);
  const tipoHoras     = formData.get('tipoHoras')      as TipoHoras;
  const horasExtras   = parseFloat(formData.get('horasExtras') as string) || 0;
  const notas         = ((formData.get('notas') as string) ?? '').trim();

  const opSnap = await adminDb.collection('operarios').doc(operarioId).get();
  const opData = opSnap.data() ?? {};
  const operarioNombre = `${opData.nombre ?? ''} ${opData.apellidos ?? ''}`.trim();

  await adminDb.collection('horarios').doc(id).update({
    operarioId, operarioNombre,
    fecha, horarioInicio, horarioFin, tipoHoras, horasExtras, notas,
    updatedAt: FieldValue.serverTimestamp(),
  });

  revalidatePath('/admin/horarios');
  revalidatePath(`/admin/horarios/${id}`);
  redirect(`/admin/horarios/${id}?editado=1`);
}

export async function eliminarHorario(id: string, _fd?: FormData) {
  await adminDb.collection('horarios').doc(id).delete();
  revalidatePath('/admin/horarios');
  redirect('/admin/horarios?eliminado=1');
}
