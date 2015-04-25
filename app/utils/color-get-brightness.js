export default function colorGetBrightness(rgb) {
  return Math.sqrt(
    rgb.r * rgb.r * 0.299 +
    rgb.g * rgb.g * 0.587 +
    rgb.b * rgb.b * 0.114);
}
