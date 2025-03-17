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

export const toUSDFormat = (number: any, digit = 2) => {
  if (number)
    return parseFloat(number).toLocaleString("en-US", {
      maximumFractionDigits: digit,
    });
  return "0";
};
