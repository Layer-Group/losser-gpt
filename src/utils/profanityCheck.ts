const dutchProfanityList = [
  "kut",
  "kanker",
  "tering",
  "godver",
  "tyfus",
  "klote",
  "fuck",
  "shit",
  // Add more Dutch profanity words as needed
];

export const containsProfanity = (text: string): boolean => {
  const lowercaseText = text.toLowerCase();
  return dutchProfanityList.some(word => 
    lowercaseText.includes(word.toLowerCase())
  );
};