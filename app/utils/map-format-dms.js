/**
 * format decimal coordinates into DMS
 * @param lat in EPSG:4326 (WSG84)
 * @param lon in EPSG:4326 (WSG84)
 * @return {object} lat and long in DMS
 */
export default function mapFormatDMS(lat, lon) {
  var dms = function (val) {
    val = Math.abs(val);
    var valdeg = Math.floor(val);
    var valmin = Math.floor((val-valdeg)*60);
    var valsec = Math.round((val-valdeg-valmin/60)*1000*3600)/1000;
    return {d: valdeg, m: valmin, s: valsec}
  };
  return {lat: dms(lat), lon: dms(lon)};
}
