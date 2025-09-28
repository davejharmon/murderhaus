export const Button = ({
  label,
  onClick,
  type = 'button',
  isActive = false,
}) => {
  const styles = {
    base: {
      minWidth: '100px', // ensures some width
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '2rem',
      fontWeight: 'bold',
      cursor: 'pointer',

      // maintain at least 0.6 height/width ratio
      aspectRatio: '5 / 3',

      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      // responsive font size, scales with button width
      fontSize: 'clamp(0.8rem, 2vw, 2rem)',
    },
    active: {
      backgroundColor: 'red',
      color: 'white',
    },
    inactive: {
      backgroundColor: 'skyblue',
      color: 'black',
    },
  };

  const buttonStyle = {
    ...styles.base,
    ...(isActive ? styles.active : styles.inactive),
  };

  return (
    <button type={type} style={buttonStyle} onClick={onClick}>
      {label}
    </button>
  );
};
