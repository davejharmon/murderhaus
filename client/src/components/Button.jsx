// Button.jsx
export function Button({ label, onClick, disabled, state }) {
  /**
   * state: 'selected' | 'confirmed' | 'unlocked' | 'locked' | 'danger'
   */

  let bgColor = '#1a1a1a';
  let color = '#fff';
  let border = '2px solid #555'; // default border for unlocked

  switch (state) {
    case 'unlocked':
      bgColor = '#222';
      color = '#fff';
      border = '2px solid #00bfa5'; // teal border for actionable
      break;

    case 'locked':
      bgColor = '#333';
      color = '#888';
      border = '2px solid #555'; // grayed out
      break;

    case 'selected':
      bgColor = '#ff9800'; // orange highlight
      color = '#fff';
      border = '2px solid #ff9800';
      break;

    case 'confirmed':
      bgColor = '#4caf50'; // green
      color = '#fff';
      border = '2px solid #4caf50';
      break;

    case 'danger':
      bgColor = '#d32f2f'; // red for interrupts
      color = '#fff';
      border = '2px solid #d32f2f';
      break;

    default:
      break;
  }

  // Override if disabled to make it visually consistent
  if (disabled) {
    bgColor = '#333';
    color = '#888';
    border = '2px solid #555';
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
        outline: 'none',
      }}
    >
      {label}
    </button>
  );
}
