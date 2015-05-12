/**
 * format decimal coordinates into DMS
 * @param lat
 * @param lon
 * @return {object} lat and long
 */
export default function mapFormatDMS(val, lon) {
  var dms = function (val) {
    val=Math.abs(val);
    valdeg=Math.floor(val);
    valmin=Math.floor((val-valdeg)*60);
    valsec=Math.round((val-valdeg-valmin/60)*1000*3600)/1000;
    return {deg: valdeg, min: valmin, sec: valsec}
  };
  return {lat: dms(lat), lon: dms(lon)};
}
