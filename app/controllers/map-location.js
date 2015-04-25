/**
 * Created by alex on 06/04/2015.
 */
import Ember from 'ember';
import getLatLng from '../utils/google-geocoder-latlng.js';

export default Ember.Controller.extend({
  needs: ['map'],
  locationSearch: null,

  panToCoords: function (map, coords) {
    var view = map.getView();
    var duration = 2000;
    var start = +new Date();
    var pan = ol.animation.pan({
      duration: duration,
      source: /** @type {ol.Coordinate} */ (view.getCenter()),
      start: start
    });
    var bounce = ol.animation.bounce({
      duration: duration,
      resolution: 4 * view.getResolution(),
      start: start
    });
    map.beforeRender(pan, bounce);
    view.setCenter(coords);
    view.setZoom(17);
    return duration;
  },

  findLocation: function () {
    var map = this.get('controllers.map.map');
    var location = this.locationSearch;
    console.log("lookup location:" + location);
    var panToCoords = this.panToCoords;
    getLatLng(location).then(function(latLng) {
        var lat = parseFloat(latLng.lat);
        var lon = parseFloat(latLng.lng);
        var center = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
        panToCoords(map, center);
    }, function(reason) {
      console.log(reason);
    });
  },

  actions: {
    findLocation: function () {
      this.findLocation();
    }
  }

})
  ;
