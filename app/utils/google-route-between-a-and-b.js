export default function googleRouteBetween(s, f) {
  var start = ol.proj.transform(s, 'EPSG:3857', 'EPSG:4326');
  var finish = ol.proj.transform(f, 'EPSG:3857', 'EPSG:4326');

  var gLatLngSrc = new google.maps.LatLng(start[1], start[0]);
  var gLatLngDst = new google.maps.LatLng(finish[1], finish[0]);

  var request = {
    origin: gLatLngSrc,
    destination: gLatLngDst,
    travelMode: google.maps.TravelMode.WALKING
  };
  var directionsService = new google.maps.DirectionsService();
  var promise = new Promise(function(resolve, reject) {
    directionsService.route(request, function (result, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        var route = [];
        for (var i = 0; i < result.routes[0].overview_path.length; i++) {
          var p = result.routes[0].overview_path[i];
          var point = ol.proj.transform([p.lng(),p.lat()], 'EPSG:4326', 'EPSG:3857');
          route.pushObject(point);
        }
        resolve(route);
      } else {
        reject(status);
      }
    });
  });
  return promise;
}
