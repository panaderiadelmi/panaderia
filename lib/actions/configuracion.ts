'use server';

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ConfiguracionEmpresa, MetodoPago } from '@/lib/types';

export async function getConfiguracion(): Promise<Partial<ConfiguracionEmpresa>> {
  const snap = await adminDb.collection('configuracion').doc('empresa').get();
  return snap.exists ? (snap.data() as ConfiguracionEmpresa) : {};
}

export async function guardarConfiguracion(formData: FormData) {
  const metodosActivos: MetodoPago[] = [];
  if (formData.get('metodo_stripe_card') === 'on') metodosActivos.push('stripe_card');
  if (formData.get('metodo_stripe_bizum') === 'on') metodosActivos.push('stripe_bizum');
  if (formData.get('metodo_efectivo_recogida') === 'on') metodosActivos.push('efectivo_recogida');

  const data: Partial<Omit<ConfiguracionEmpresa, 'updatedAt'>> & { updatedAt: unknown } = {
    nombreFiscal:         formData.get('nombreFiscal') as string,
    nif:                  formData.get('nif') as string,
    direccionFiscal:      formData.get('direccionFiscal') as string,
    codigoPostal:         formData.get('codigoPostal') as string,
    municipio:            formData.get('municipio') as string,
    provincia:            formData.get('provincia') as string,
    regimen:              (formData.get('regimen') as 'autonomo' | 'sociedad') ?? 'autonomo',
    telefonoPublico:      formData.get('telefonoPublico') as string,
    whatsapp:             formData.get('whatsapp') as string,
    emailPublico:         formData.get('emailPublico') as string,
    direccionFisica:      formData.get('direccionFisica') as string,
    horario:              formData.get('horario') as string,
    nombreWeb:            formData.get('nombreWeb') as string,
    tagline:              formData.get('tagline') as string,
    instagram:            formData.get('instagram') as string,
    facebook:             formData.get('facebook') as string,
    heroTitulo:           formData.get('heroTitulo') as string,
    heroSubtitulo:        formData.get('heroSubtitulo') as string,
    statsAnios:           parseInt(formData.get('statsAnios') as string) || 0,
    statsClientes:        parseInt(formData.get('statsClientes') as string) || 0,
    statsVariedades:      parseInt(formData.get('statsVariedades') as string) || 0,
    metodosActivos,
    antelacionMinimaHoras: parseInt(formData.get('antelacionMinimaHoras') as string) || 24,
    maxPedidosPorFranja:  parseInt(formData.get('maxPedidosPorFranja') as string) || 20,
    avisoLegal:           formData.get('avisoLegal') as string,
    politicaPrivacidad:   formData.get('politicaPrivacidad') as string,
    politicaCookies:      formData.get('politicaCookies') as string,
    condicionesVenta:     formData.get('condicionesVenta') as string,
    updatedAt:            FieldValue.serverTimestamp(),
  };

  await adminDb.collection('configuracion').doc('empresa').set(data, { merge: true });
  revalidatePath('/admin/configuracion');
  redirect('/admin/configuracion?guardado=1');
}
