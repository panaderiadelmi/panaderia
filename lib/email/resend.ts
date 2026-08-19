import { Resend } from 'resend';
import type { EstadoPedido, FranjaRecogida } from '@/lib/types';

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}
const FROM = 'Señas Gómez <pedidos@senasgomez.com>';

interface EmailData {
  numero: string;
  clienteEmail: string;
  clienteNombre: string;
  estado: EstadoPedido;
  franjaRecogida?: FranjaRecogida;
}

const TEMPLATES: Partial<Record<EstadoPedido, (d: EmailData) => { subject: string; html: string }>> = {
  confirmado: (d) => ({
    subject: `Pedido ${d.numero} confirmado`,
    html: buildHtml({
      titulo: '✅ Pedido confirmado',
      nombre: d.clienteNombre,
      numero: d.numero,
      cuerpo: 'Tu pedido ha sido confirmado y está en nuestra lista de preparación.',
      franja: d.franjaRecogida,
    }),
  }),
  elaborando: (d) => ({
    subject: `Pedido ${d.numero} en elaboración`,
    html: buildHtml({
      titulo: '🔥 Preparando tu pedido',
      nombre: d.clienteNombre,
      numero: d.numero,
      cuerpo: 'Nuestros artesanos están preparando tu pedido ahora mismo.',
      franja: d.franjaRecogida,
    }),
  }),
  listo: (d) => ({
    subject: `Pedido ${d.numero} listo para recoger`,
    html: buildHtml({
      titulo: '📦 ¡Tu pedido está listo!',
      nombre: d.clienteNombre,
      numero: d.numero,
      cuerpo: 'Tu pedido ya está empaquetado y esperándote. Puedes venir a recogerlo en la franja indicada.',
      franja: d.franjaRecogida,
    }),
  }),
  recogido: (d) => ({
    subject: `Pedido ${d.numero} recogido — ¡Gracias!`,
    html: buildHtml({
      titulo: '🏠 Pedido recogido',
      nombre: d.clienteNombre,
      numero: d.numero,
      cuerpo: '¡Gracias por elegirnos! Esperamos que disfrutes tu compra. Hasta pronto.',
    }),
  }),
  cancelado: (d) => ({
    subject: `Pedido ${d.numero} cancelado`,
    html: buildHtml({
      titulo: '❌ Pedido cancelado',
      nombre: d.clienteNombre,
      numero: d.numero,
      cuerpo: 'Lamentamos informarte de que tu pedido ha sido cancelado. Si tienes alguna duda, contáctanos.',
    }),
  }),
};

export async function sendEstadoEmail(data: EmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;
  const tplFn = TEMPLATES[data.estado];
  if (!tplFn) return;
  const { subject, html } = tplFn(data);
  await getResend().emails.send({ from: FROM, to: data.clienteEmail, subject, html });
}

function buildHtml({ titulo, nombre, numero, cuerpo, franja }: {
  titulo: string;
  nombre: string;
  numero: string;
  cuerpo: string;
  franja?: FranjaRecogida;
}): string {
  const franjaBlock = franja ? `
    <div style="background:#fff8ed;border:1px solid #f5a623;border-radius:6px;padding:14px 18px;margin:20px 0;">
      <p style="margin:0;font-size:12px;color:#b45309;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Franja de recogida</p>
      <p style="margin:6px 0 0;font-size:15px;font-weight:700;color:#111;">${franja.fecha}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#444;">${franja.horaInicio} – ${franja.horaFin}</p>
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;max-width:580px;width:100%;">
        <tr><td style="background:#111;padding:24px 32px;">
          <p style="margin:0;font-size:20px;font-weight:900;color:#f5a623;letter-spacing:-0.02em;">Señas Gómez</p>
          <p style="margin:4px 0 0;font-size:12px;color:#999;">Artesanos del pan</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 12px;font-size:22px;color:#111;">${titulo}</h1>
          <p style="margin:0 0 16px;font-size:14px;color:#555;">Hola, <strong>${nombre}</strong>.</p>
          <p style="margin:0 0 8px;font-size:15px;color:#333;line-height:1.6;">${cuerpo}</p>
          <p style="margin:0;font-size:13px;color:#888;">Pedido: <strong style="color:#111;">${numero}</strong></p>
          ${franjaBlock}
        </td></tr>
        <tr><td style="background:#f9f9f9;padding:18px 32px;border-top:1px solid #eee;">
          <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">Señas Gómez · Si tienes alguna duda, contáctanos en pedidos@senasgomez.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
