/**
 * Created by alex on 06/04/2015.
 */
import Ember from 'ember';
import getLatLng from '../utils/google-geocoder-latlng.js';
import geoLoc from '../utils/geocoding-watch-position.js';

export default Ember.Controller.extend({
  needs: ['map'],
  locationSearch: null,

  state: function (value) {
    if (arguments > 1) {
      var state = this.get('state');
      state.set('state', value);
      state.save();
    } else {
      return this.store.all('mtgState');
    }
  },

  command: function (options) {
    var commands = this.store.all('mtgCommand');
    commands.pushObject({
      key: options.key,
      options: options.value
    });
    console.log('sending command :' + options.key);
  },

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
    getLatLng(location).then(function (latLng) {
      var lat = parseFloat(latLng.lat);
      var lon = parseFloat(latLng.lng);
      var center = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
      panToCoords(map, center);
    }, function (reason) {
      console.log(reason);
    });
  },

  gpsLocation: function () {
    var me = this;
    var map = this.get('controllers.map.map');
    this.state( {
        map: {
          location: {
            gps: 'start'
          }
        }
      }
    );
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
      me.command({
          key: 'map.draw.point',
          value: options
        }
      );

      me.mapDrawService.drawPoint(options).then(function (feature) {
        me.set('gpsPoint', feature)
      });
    }, function (reason) {
      console.log(reason);
    });
  },

  actions: {
    findLocation: function () {
      this.findLocation();
    },
    gpsLocation: function () {
      this.gpsLocation();
    }
  }

})
  ;
