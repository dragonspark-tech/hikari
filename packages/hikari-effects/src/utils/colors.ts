/**
 * Converts a hexadecimal color code into an RGB representation normalized to a scale of 0 to 1.
 *
 * @param {number} hexCode - A 24-bit integer representing a color in hexadecimal format.
 * @return {[number, number, number]} An array containing the normalized red, green, and blue values, each scaled between 0 and 1.
 */
export function normalizeColor(hexCode: number): [number, number, number] {
  return [
    ((hexCode >> 16) & 255) / 255,
    ((hexCode >> 8) & 255) / 255,
    (255 & hexCode) / 255
  ];
}