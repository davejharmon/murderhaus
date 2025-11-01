export const Button = ({
  label,
  onClick,
  type = 'button',
  isActive = false,
  isNext = false,
  disabled = false,
}) => {
  const styles = {
    base: {
      minWidth: '100px',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '2rem',
      fontWeight: 'bold',
      cursor: disabled ? 'not-allowed' : 'pointer',
      aspectRatio: '5 / 3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'clamp(0.8rem, 2vw, 2rem)',
      transition: 'background-color 0.2s, color 0.2s',
      opacity: disabled ? 0.5 : 1,
    },
    active: {
      backgroundColor: 'red',
      color: 'white',
    },
    next: {
      backgroundColor: '#87cefa',
      color: 'black',
    },
    inactive: {
      backgroundColor: 'skyblue',
      color: 'black',
    },
  };

  const buttonStyle = {
    ...styles.base,
    ...(isActive ? styles.active : isNext ? styles.next : styles.inactive),
  };

  return (
    <button
      type={type}
      style={buttonStyle}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};
