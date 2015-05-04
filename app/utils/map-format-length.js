import mapConst from "../utils/map-const.js";

/**
 * format length output
 * @param {ol.geom.LineString} line
 * @return {string}
 */
export default function mapFormatLength(projection, line) {
  var length;
  var coordinates = line.getCoordinates();
  length = 0;
  for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
    var c1 = ol.proj.transform(coordinates[i], projection, 'EPSG:4326');
    var c2 = ol.proj.transform(coordinates[i + 1], projection, 'EPSG:4326');
    length += mapConst.wgs84Sphere.haversineDistance(c1, c2);
  }
  var output;
  if (length > 1000) {
    output = (Math.round(length / 1000 * 100) / 100) +
    ' ' + 'km';
  } else {
    output = (Math.round(length * 100) / 100) +
    ' ' + 'm';
  }
  return output;
}
