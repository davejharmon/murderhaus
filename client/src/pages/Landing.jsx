import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Welcome to Murderhaus</h1>
      <p>Select your role to proceed:</p>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginTop: '20px',
        }}
      >
        <button onClick={() => navigate('/host')}>Host</button>
        <button onClick={() => navigate('/player/1')}>Player 1</button>
        <button onClick={() => navigate('/dashboard')}>Dashboard</button>
      </div>
    </div>
  );
};

export default Landing;
