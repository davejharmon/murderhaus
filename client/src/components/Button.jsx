// Button.jsx
export function Button({ label, onClick, disabled, state }) {
  /**
   * state: 'selected' | 'confirmed' | 'unlocked' | 'locked' | 'danger'
   */

  let bgColor = '#1a1a1a';
  let color = '#fff';
  let border = '2px solid #d32f2f'; // default unlocked style

  if (state === 'selected' || state === 'confirmed' || state === 'danger') {
    bgColor = '#d32f2f';
    color = '#fff';
    border = '2px solid #d32f2f';
  } else if (disabled) {
    bgColor = '#333';
    color = '#888';
    border = '2px solid #333';
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
