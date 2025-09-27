export const BigNum = ({ value }) => {
  const styles = {
    number: {
      fontSize: '3rem', // adjust for "big" number
      fontWeight: 'bold',
      textAlign: 'center',
    },
  };

  return <div style={styles.number}>{value}</div>;
};
