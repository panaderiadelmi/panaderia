'use client';

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn-ghost no-print"
      style={{ fontSize: '0.8rem', padding: '8px 14px' }}
    >
      🖨️ Imprimir
    </button>
  );
}
