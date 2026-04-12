// Level setup used by the game
// n: board size
// scramble: random legal moves from solved board
// maxOn: max lights ON after generation to keep it easier early on
export const levels = [
  // 3x3 easy levels
  { n: 3, scramble: 1, maxOn: 3 },
  { n: 3, scramble: 4, maxOn: 5 },
  { n: 3, scramble: 6, maxOn: 7 },

  // 4x4 medium levels
  { n: 4, scramble: 3, maxOn: 3 },
  { n: 4, scramble: 6, maxOn: 7 },
  { n: 4, scramble: 10, maxOn: 10 },

  // 5x5 hard levels
  { n: 5, scramble: 3, maxOn: 3 },
  { n: 5, scramble: 6, maxOn: 8 },
  { n: 5, scramble: 10, maxOn: 12 },
  { n: 5, scramble: 14, maxOn: 16 },
  { n: 5, scramble: 20, maxOn: 20 },
];