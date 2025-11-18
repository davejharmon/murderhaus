export function Button({ label, onClick, disabled, state }) {
  /**
   * state: 'selected' | 'confirmed' | 'unlocked' | 'locked' | 'danger' | 'enabled'
   */

  // If disabled AND not visually important → force "disabled" style
  const effectiveState =
    disabled && !['selected', 'confirmed', 'danger'].includes(state)
      ? 'disabled'
      : state;

  let bgColor = '#1a1a1a';
  let color = '#fff';
  let border = '2px solid #555';

  switch (effectiveState) {
    case 'enabled':
      bgColor = '#222';
      color = '#fff';
      border = '2px solid #00bfa5';
      break;

    case 'selected':
      bgColor = '#ff9800';
      color = '#fff';
      border = '2px solid #ff9800';
      break;

    case 'confirmed':
      bgColor = '#4caf50';
      color = '#fff';
      border = '2px solid #4caf50';
      break;

    case 'danger':
      bgColor = '#d32f2f';
      color = '#fff';
      border = '2px solid #d32f2f';
      break;

    case 'disabled':
      bgColor = '#333';
      color = '#888';
      border = '2px solid #555';
      break;
  }

  const handleClick = (e) => {
    if (!disabled) onClick?.(e);
    e.currentTarget.blur();
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

        // Don't dim selected / confirmed / danger even if disabled
        opacity:
          disabled && ['selected', 'confirmed', 'danger'].includes(state)
            ? 1
            : disabled
            ? 0.6
            : 1,

        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      {label}
    </button>
  );
}
