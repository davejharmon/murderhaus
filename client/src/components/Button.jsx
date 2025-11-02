export const Button = ({
  label,
  onClick,
  type = 'button',
  isActive = false,
  isNext = false,
  disabled = false,
}) => {
  const baseStyle = {
    minWidth: '100px',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '1.5rem',
    fontWeight: 'bold',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(0.8rem, 1.5vw, 1.2rem)',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.5 : 1,
    userSelect: 'none',
  };

  const variantStyle = isActive
    ? { backgroundColor: '#d32f2f', color: '#fff' } // active = red
    : isNext
    ? { backgroundColor: '#4fc3f7', color: '#000' } // next = light blue
    : { backgroundColor: '#90caf9', color: '#000' }; // default inactive = skyblue

  const hoverStyle = !disabled
    ? { filter: 'brightness(1.1)', boxShadow: '0 2px 5px rgba(0,0,0,0.15)' }
    : {};

  return (
    <button
      type={type}
      style={{ ...baseStyle, ...variantStyle }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverStyle)}
      onMouseLeave={(e) =>
        Object.assign(e.currentTarget.style, { filter: '', boxShadow: '' })
      }
    >
      {label}
    </button>
  );
};
