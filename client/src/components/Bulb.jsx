export const Bulb = ({ col = '#000000' }) => {
  const styles = {
    circle: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: col, // fill with prop color
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      border: '2px solid #555', // optional border for visibility
    },
  };

  return <div style={styles.circle}></div>;
};
