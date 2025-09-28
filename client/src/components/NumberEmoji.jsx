// components/NumberEmoji.jsx
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
  return <span>{codepoints[number] ?? '❓'}</span>;
};
