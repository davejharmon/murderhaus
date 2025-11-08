import React, { useMemo } from 'react';

export const NumberEmoji = React.memo(function NumberEmoji({
  number,
  isConfirmed = true,
}) {
  const style = useMemo(() => {
    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '1.5em',
      height: '1.5em',
      border: '2px solid #000',
      borderRadius: '0.25em',
      fontWeight: 'bold',
      fontSize: '1em',
      lineHeight: 1,
      textAlign: 'center',
      userSelect: 'none',
      backgroundColor: '#fff',
      color: '#000',
      opacity: isConfirmed ? 1 : 0.4,
      transition: 'opacity 0.25s',
      marginRight: '0.25em',
    };
  }, [isConfirmed]);

  return <span style={style}>{number}</span>;
});
