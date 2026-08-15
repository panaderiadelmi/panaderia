import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie, deleteSessionCookie } from '@/lib/firebase/auth';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: 'idToken requerido' }, { status: 400 });
    }
    await createSessionCookie(idToken);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error creando sesión:', err);
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}

export async function DELETE() {
  await deleteSessionCookie();
  return NextResponse.json({ ok: true });
}
