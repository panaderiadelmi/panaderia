'use client';

interface Props {
  action: () => Promise<void>;
  mensaje?: string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function DeleteButton({ action, mensaje = '¿Eliminar? Esta acción no se puede deshacer.', label = 'Eliminar', className = 'btn-danger', style }: Props) {
  return (
    <form action={action}>
      <button
        type="submit"
        className={className}
        style={style}
        onClick={(e) => { if (!confirm(mensaje)) e.preventDefault(); }}
      >
        {label}
      </button>
    </form>
  );
}
