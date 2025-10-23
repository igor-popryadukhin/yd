export const createRandomGenerator = (seed: number) => {
  let value = seed;
  return () => {
    value += 0x6d2b79f5;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const pickOne = <T>(values: T[], random: () => number): T => {
  const index = Math.floor(random() * values.length);
  return values[index];
};
