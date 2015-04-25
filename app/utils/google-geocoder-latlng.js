export default function googleGeocoderLatlng(address) {
  var geocoder = new google.maps.Geocoder();
  var promise = new Promise(function(resolve, reject) {
    geocoder.geocode({'address': address}, function (results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        //In this case it creates a marker, but you can get the lat and lng from the location.LatLng
        var loc = results[0].geometry.location;
        // on success
        resolve({
          lat: loc.lat(),
          lng: loc.lng()
        });
      } else {
        // on failure
        reject("error in googleGeocoderLatlng: " + status);
      }
    });
  });
  return promise;
}
