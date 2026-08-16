'use client';

export function DeleteButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={e => {
        if (!window.confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="btn-danger">Eliminar</button>
    </form>
  );
}
