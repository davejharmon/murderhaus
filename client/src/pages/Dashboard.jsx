import React from 'react';

const Dashboard = () => {
  const playerCount = 9;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '50% 50%',
        gridTemplateRows: 'repeat(3, 1fr)',
        height: '100vh',
        width: '100vw',
      }}
    >
      {/* Host on left, spanning 3 rows */}
      <iframe
        src='/host'
        title='Host'
        style={{ gridRow: '1 / span 3', border: '1px solid #ccc' }}
      />

      {/* 9 Players on right 3x3 grid */}
      {Array.from({ length: playerCount }, (_, i) => (
        <iframe
          key={i}
          src={`/player/p${i + 1}`}
          title={`Player ${i + 1}`}
          style={{ border: '1px solid #ccc' }}
        />
      ))}
    </div>
  );
};

export default Dashboard;
