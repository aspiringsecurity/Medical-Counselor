/* eslint-disable no-bitwise */
import { stringToColor } from './stringToColor';

function rgbToHex(r: number, g: number, b: number) {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function generateAngle(value: string) {
  return `${Math.floor(parseInt(value, 36) * 361)}deg`;
}

/** Generate random linear gradient values */
export function generateRandomGradient(value: string) {
  const angle = generateAngle(value);
  const generatedColor = stringToColor(value);
  const color = generatedColor.substring(1);

  const color1 = rgbToHex(parseInt(color.substring(0, 2), 16), 200, 200); // hexToR
  const color2 = rgbToHex(200, 200, parseInt(color.substring(4, 6), 16)); // hexToB
  const color3 = rgbToHex(200, parseInt(color.substring(2, 4), 16), 200); // hexToG

  return [angle, color1, color2, color3];
}
