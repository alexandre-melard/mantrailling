/**
 * Created by A140980 on 02/05/2015.
 */
export default function geocodingWatchPosition() {
  var geo_options = {
    enableHighAccuracy: true,
    maximumAge        : 30000,
    timeout           : 27000
  };
  return new Promise(function(resolve, error) {
    navigator.geolocation.watchPosition(resolve, error, geo_options);
  });
}
