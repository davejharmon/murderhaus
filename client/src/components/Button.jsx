export const Button = ({
  label,
  onClick,
  type = 'button',
  isActive = false,
  isNext = false,
}) => {
  const styles = {
    base: {
      minWidth: '100px',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '2rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      aspectRatio: '5 / 3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'clamp(0.8rem, 2vw, 2rem)',
      transition: 'background-color 0.2s, color 0.2s',
    },
    active: {
      backgroundColor: 'red',
      color: 'white',
    },
    next: {
      backgroundColor: '#87cefa', // lighter blue for NEXT button
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
    <button type={type} style={buttonStyle} onClick={onClick}>
      {label}
    </button>
  );
};
