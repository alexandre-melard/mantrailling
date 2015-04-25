export default function colorGetRgb(hex) {
  var color = {};
  hex = hex.substr(1, 6);
  color.r = parseInt(hex.substr(0, 2), 16);
  color.g = parseInt(hex.substr(2, 2), 16);
  color.b = parseInt(hex.substr(4, 2), 16);
  return color;
}
