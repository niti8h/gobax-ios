const rotateLeft = (value: number, amount: number) => (value << amount) | (value >>> (32 - amount));
const addUnsigned = (left: number, right: number) => (left + right) >>> 0;

export const md5 = (input: string) => {
  const bytes = unescape(encodeURIComponent(input));
  const words: number[] = [];

  for (let index = 0; index < bytes.length; index += 1) {
    words[index >> 2] = (words[index >> 2] || 0) | (bytes.charCodeAt(index) << ((index % 4) * 8));
  }

  const bitLength = bytes.length * 8;
  words[bitLength >> 5] = (words[bitLength >> 5] || 0) | (0x80 << (bitLength % 32));
  words[(((bitLength + 64) >>> 9) << 4) + 14] = bitLength;
  words[(((bitLength + 64) >>> 9) << 4) + 15] = 0;

  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  const functions = [
    (x: number, y: number, z: number) => (x & y) | (~x & z),
    (x: number, y: number, z: number) => (x & z) | (y & ~z),
    (x: number, y: number, z: number) => x ^ y ^ z,
    (x: number, y: number, z: number) => y ^ (x | ~z),
  ];
  const shifts = [
    [7, 12, 17, 22],
    [5, 9, 14, 20],
    [4, 11, 16, 23],
    [6, 10, 15, 21],
  ];

  for (let offset = 0; offset < words.length; offset += 16) {
    const originalA = a;
    const originalB = b;
    const originalC = c;
    const originalD = d;

    for (let round = 0; round < 64; round += 1) {
      let index: number;
      let functionIndex: number;
      if (round < 16) {
        index = round;
        functionIndex = 0;
      } else if (round < 32) {
        index = (5 * round + 1) % 16;
        functionIndex = 1;
      } else if (round < 48) {
        index = (3 * round + 5) % 16;
        functionIndex = 2;
      } else {
        index = (7 * round) % 16;
        functionIndex = 3;
      }

      const sine = Math.floor(Math.abs(Math.sin(round + 1)) * 0x100000000);
      const value = addUnsigned(
        addUnsigned(addUnsigned(a, functions[functionIndex](b, c, d)), words[offset + index] || 0),
        sine,
      );
      const rotated = addUnsigned(rotateLeft(value, shifts[functionIndex][round % 4]), b);
      a = d;
      d = c;
      c = b;
      b = rotated;
    }

    a = addUnsigned(a, originalA);
    b = addUnsigned(b, originalB);
    c = addUnsigned(c, originalC);
    d = addUnsigned(d, originalD);
  }

  return [a, b, c, d]
    .flatMap((value) => [0, 8, 16, 24].map((shift) => (value >>> shift) & 0xff))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
};
