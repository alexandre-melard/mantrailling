export default function googleGeocoderAddress(lat, lng) {
  var geocoder = new google.maps.Geocoder();
  var latlng = new google.maps.LatLng(lat, lng);
  var promise = new Promise(function(resolve, reject) {
    geocoder.geocode({'latLng': latlng}, function (results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        resolve(results[0].formatted_address);
      } else {
        reject("address not found for these coordinates");
      }
    });
  });
  return promise;
}
