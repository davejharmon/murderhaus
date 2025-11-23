// src/components/Button.jsx
import styles from './Button.module.css';

export function Button({ label, onClick, disabled, state }) {
  /**
   * state: 'selected' | 'confirmed' | 'enabled' | 'disabled' | 'danger'
   */

  // If disabled AND not visually important → force "disabled" style
  const effectiveState =
    disabled && !['selected', 'confirmed', 'danger'].includes(state)
      ? 'disabled'
      : state;

  const handleClick = (e) => {
    if (!disabled) onClick?.(e);
    e.currentTarget.blur();
  };

  return (
    <button
      className={`${styles.button} ${styles[effectiveState]}`}
      disabled={disabled}
      onClick={handleClick}
    >
      {label}
    </button>
  );
}
