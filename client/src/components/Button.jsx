export function Button({ label, onClick, disabled, isActive, variant }) {
  const bgColor =
    variant === 'danger' ? '#d32f2f' : isActive ? '#646cff' : '#1a1a1a';

  const color = variant === 'danger' ? '#fff' : isActive ? '#fff' : '#fff';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: bgColor,
        color,
        border: '1px solid transparent',
        borderRadius: '8px',
        padding: '0.6em 1.2em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 500,
        transition: '0.25s',
      }}
    >
      {label}
    </button>
  );
}
