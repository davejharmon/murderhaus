import React, { useEffect, useState } from 'react';

export default function CountdownTimer({ startTime }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(i);
  }, []);

  const diff = Math.max(0, startTime - now);
  const seconds = Math.ceil(diff / 1000);

  return <div className='bigscreen-countdown'>{seconds}</div>;
}
