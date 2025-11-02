export const Bulb = ({ player, size = 40 }) => {
  const color = player.bulbColor || '#555555'; // use server-provided color

  const style = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    background: `radial-gradient(circle at 30% 30%, ${color} 0%, #111 80%)`,
    display: 'inline-block',
  };

  return <div style={style} />;
};
