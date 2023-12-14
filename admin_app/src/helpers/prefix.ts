import akronim from "akronim";

export const generatePrefixBasedOnText = (text: string) => {
  const suggestions = [];
  if (text.length > 1) {
    const firstTwoLetters = `${text[0]}${text[1]}`.toUpperCase();
    if (firstTwoLetters.length > 0) {
      suggestions.push(firstTwoLetters);
    }
  }
  if (text.length > 2) {
    const firstThreeLetters = `${text[0]}${text[1]}${text[2]}`.toUpperCase();
    if (firstThreeLetters.length > 0) {
      suggestions.push(firstThreeLetters);
    }
  }
  const acronym = akronim(text);
  if (acronym.length != 0) {
    suggestions.push(acronym);
  }

  return suggestions;
};
