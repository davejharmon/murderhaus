export const Bulb = ({ col = '#000000' }) => {
  const styles = {
    wrapper: {
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    circle: {
      width: 'clamp(20px, 80%, 100px)', // min 20px, max 100px, otherwise fill ~80% of cell
      height: 'clamp(20px, 80%, 100px)', // keep square for circle
      borderRadius: '50%',
      backgroundColor: col,
      border: '2px solid #555',
      boxShadow: `0 0 10px ${col}`, // glow effect
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.circle}></div>
    </div>
  );
};
