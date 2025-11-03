// src/components/NumberEmoji.jsx
export const NumberEmoji = ({ number, isConfirmed = true }) => {
  return (
    <span
      style={{
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
        marginRight: '0.25em', // optional spacing between numbers
      }}
    >
      {number}
    </span>
  );
};
