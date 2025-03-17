export const escapeMarkdownV2 = (text: string) => {
  const reservedChars = [
    "_",
    "*",
    "[",
    "]",
    "(",
    ")",
    "~",
    "`",
    ">",
    "#",
    "+",
    "-",
    "=",
    "|",
    "{",
    "}",
    ".",
    "!",
  ];
  return text
    .split("")
    .map((char) => (reservedChars.includes(char) ? `\\${char}` : char))
    .join("");
};

export const toUSDFormat = (value: any) => {
  if (!value) return "";
  return Math.floor(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
