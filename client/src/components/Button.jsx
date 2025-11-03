export function Button({ label, onClick, disabled, isActive, state, variant }) {
  /**
   * variant: existing (e.g., 'danger')
   * state: 'selected' | 'unlocked' | undefined
   */
  let bgColor = '#1a1a1a';
  let color = '#fff';
  let border = '1px solid transparent';

  // 1️⃣ Variant-based styles
  if (variant === 'danger') {
    bgColor = '#d32f2f';
    color = '#fff';
  }

  // 2️⃣ State-based overrides (take precedence)
  if (state === 'selected') {
    bgColor = '#d32f2f'; // red background
    color = '#fff'; // white text
    border = '1px solid transparent'; // override any unlocked border
  } else if (state === 'unlocked') {
    border = '2px solid #d32f2f'; // red border
    if (!variant) bgColor = '#1a1a1a'; // keep default background if no variant
  } else if (isActive) {
    bgColor = '#646cff'; // existing active color
    color = '#fff';
  }

  return (
    <button
      onClick={onClick}
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
      }}
    >
      {label}
    </button>
  );
}
