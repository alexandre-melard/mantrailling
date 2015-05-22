/**
 * Created by alex on 06/04/2015.
 */
import Ember from 'ember';
import getLatLng from '../utils/google-geocoder-latlng.js';
import geoLoc from '../utils/geocoding-watch-position.js';

export default Ember.Controller.extend({
  needs: ['map'],
  locationSearch: null,

  panToCoords: function (map, coords) {
    var view = map.getView();
    var duration = 2000;
    var start = +new Date();
    var pan = ol.animation.pan({
      duration: duration,
      source: (view.getCenter()),
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

  centerTo: function(map, lat, lon, me) {
    var center = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
    me.panToCoords(map, center);
    var options = {
      radius: 10,
      color: "#0000ff",
      opacity: "0.3",
      key: "PointType",
      value: "Location",
      label: "",
      location: center,
      removeFeature: me.get('locationPoint')
    };
    me.command.send('map.draw.point', options,
      function (feature) {
        me.set('locationPoint', feature);
      },
      function (reason) {
        console.log(reason);
      });
  },

  findLocation: function () {
    var me = this;
    var map = this.get('controllers.map.map');
    var location = this.get('locationSearch');
    console.log("lookup location:" + location);
    var re = /(\d+)° (\d+)′ (\d+)″ \w+ (\d+)° (\d+)′ (\d+)″ \w+/;
    if (re.test(location)) {
      var match = re.exec(location);
      var lat = parseFloat(match[1]) + parseFloat(match[2])/60.0 + parseFloat(match[3])/3600.0 * 1/1000000;
      var lon = parseFloat(match[4]) + parseFloat(match[5])/60.0 + parseFloat(match[6])/3600.0 * 1/1000000;
      me.centerTo(map, lat, lon, me);
    }
    getLatLng(location).then(function (latLng) {
      var lat = parseFloat(latLng.lat);
      var lon = parseFloat(latLng.lng);
      me.centerTo(map, lat, lon, me);
    }, function (reason) {
      console.log(reason);
    });
  },

  gpsLocation: function () {
    var me = this;
    var map = this.get('controllers.map.map');
    console.log("gps location");
    geoLoc().then(function (position) {
      var lat = parseFloat(position.coords.latitude);
      var lon = parseFloat(position.coords.longitude);
      var center = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
      var view = map.getView();
      view.setCenter(center);
      view.setZoom(16);
      var options = {
        radius: 10,
        color: "#0000ff",
        opacity: "0.3",
        key: "PointType",
        value: "GPS",
        label: "",
        location: center,
        removeFeature: me.get('gpsPoint')
      };
      me.command.send('map.draw.point', options,
        function (feature) {
          me.set('gpsPoint', feature);
        },
        function (reason) {
          console.log(reason);
        });
    });
  },

  actions: {
    findLocation: function () {
      this.findLocation();
    },
    gpsLocation: function () {
      this.gpsLocation();
    },
    locateOnMap: function () {
      var options = {
        tooltip: "Click on the map to get the coordinates"
      };
      this.command.send('map.draw.location', options);
    }
  }

})
  ;
