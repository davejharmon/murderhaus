// src/components/NumberEmoji.jsx
export const NumberEmoji = ({ number }) => {
  const codepoints = [
    '0️⃣',
    '1️⃣',
    '2️⃣',
    '3️⃣',
    '4️⃣',
    '5️⃣',
    '6️⃣',
    '7️⃣',
    '8️⃣',
    '9️⃣',
  ];

  const emoji = codepoints[number] ?? '❓';

  return (
    <span
      style={{
        fontSize: 'clamp(2rem, 6vw, 6rem)',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {emoji}
    </span>
  );
};
