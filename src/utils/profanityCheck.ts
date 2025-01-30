const dutchProfanityList = [
  "kut",
  "kanker",
  "tering",
  "godver",
  "tyfus",
  "klote",
  "fuck",
  "shit",
  "hoer",
  "slet",
  "lul",
  "sukkel",
  "mongool",
  "debiel",
  "idioot",
  "stomkop",
  "achterlijk",
  "trut",
  "klootzak",
  "rotmof",
  "schijt",
  "verdomme",
  "godverdomme",
  "neuk",
  "flikker",
  "homo",
  "mietje",
  "teef",
  "bitch",
  "pik",
  "reet",
  "stront",
];

export const containsProfanity = (text: string): boolean => {
  const lowercaseText = text.toLowerCase();
  return dutchProfanityList.some(word => 
    lowercaseText.includes(word.toLowerCase())
  );
};