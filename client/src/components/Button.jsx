export const Button = ({
  label,
  onClick,
  type = 'button',
  isActive = false,
}) => {
  // Define styles as objects
  const styles = {
    active: {
      backgroundColor: 'red',
      color: 'white',
    },
    inactive: {
      backgroundColor: 'skyblue',
      color: 'black',
    },
  };

  const buttonStyle = isActive ? styles.active : styles.inactive;

  return (
    <button type={type} style={buttonStyle} onClick={onClick}>
      {label}
    </button>
  );
};
