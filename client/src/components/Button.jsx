// Button.jsx
export function Button({ label, onClick, disabled, state }) {
  /**
   * state: 'selected' | 'confirmed' | 'unlocked' | 'locked' | 'danger' | 'warning'
   */

  let bgColor = '#1a1a1a';
  let color = '#fff';
  let border = '2px solid #d32f2f'; // default unlocked style

  switch (state) {
    case 'selected':
    case 'confirmed':
    case 'danger':
      bgColor = '#d32f2f';
      color = '#fff';
      border = '2px solid #d32f2f';
      break;
    case 'warning':
      bgColor = '#fbc02d'; // yellow
      color = '#000'; // black text for contrast
      border = '2px solid #fbc02d';
      break;
    default:
      if (disabled) {
        bgColor = '#333';
        color = '#888';
        border = '2px solid #333';
      }
      break;
  }

  const handleClick = (e) => {
    onClick?.(e);
    e.currentTarget.blur(); // remove focus after click
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={{
        backgroundColor: bgColor,
        color,
        border,
        borderRadius: '8px',
        padding: '0.6em 1.2em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 500,
        transition: '0.25s',
        outline: 'none', // remove focus outline
      }}
    >
      {label}
    </button>
  );
}
