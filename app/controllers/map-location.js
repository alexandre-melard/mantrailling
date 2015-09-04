/**
 * Created by alex on 06/04/2015.
 */
import Ember from 'ember';
import getLatLng from '../utils/google-geocoder-latlng';
import geoLoc from '../utils/geocoding-watch-position';
import consts from '../utils/map-constants';

export default Ember.Controller.extend({
  needs: ['map'],

  bindActions: function () {
    var me = this;
    this.command.register(this, 'actions.map.location.find', function (options) {
      return new Promise(function (resolve) {
        me.command.send('map.location.find', $(".map-location-search-input").val(), function (options) {
          console.log("location found");
          me.command.send('map.location.found', options, resolve);
        });
      });
    });
    this.command.register(this, 'actions.map.location.gps.watch', function (options) {
      return new Promise(function (resolve) {
        me.command.send('map.location.gps.watch', null, function (options) {
          console.log("gps found");
          me.command.send('map.location.gps.watching', options, resolve);
        });
      });
    });
    this.command.register(this, 'actions.map.location.coordinates', function (options) {
      return new Promise(function (resolve) {
        me.command.send('map.draw.location', {
          tooltip: me.get('i18n').t("map.location.coordinates.tooltip")
        });
      });
    });
  }.on('init'),

  bindCommand: function () {
    this.command.register(this, 'map.location.find', this.findLocation);
    this.command.register(this, 'map.location.gps.watch', this.gpsLocation);
  }.on('init'),

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

  centerTo: function (map, lat, lon, me) {
    var center = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
    me.panToCoords(map, center);
    var options = {
      style: consts.style[consts.LOCATION],
      key: "PointType",
      value: "Location",
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

  findLocation: function (location) {
    var me = this;
    var map = this.get('controllers.map.map');
    console.log("lookup location:" + location);
    var re = /(\d+)° (\d+)′ (\d+)″ \w+ (\d+)° (\d+)′ (\d+)″ \w+/;
    return new Promise(function (resolve, fail) {
      if (re.test(location)) {
        var match = re.exec(location);
        var lat = parseFloat(match[1]) + parseFloat(match[2]) / 60.0 + parseFloat(match[3]) / 3600.0;
        var lon = parseFloat(match[4]) + parseFloat(match[5]) / 60.0 + parseFloat(match[6]) / 3600.0;
        me.centerTo(map, lat, lon, me);
        resolve({lat: lat, lon: lon});
      } else {
        getLatLng(location).then(function (latLng) {
          var lat = parseFloat(latLng.lat);
          var lon = parseFloat(latLng.lng);
          me.centerTo(map, lat, lon, me);
          resolve({lat: lat, lon: lon});
        }, function (reason) {
          console.log(reason);
          fail(reason);
        });
      }
    });
  },

  gpsLocation: function () {
    var me = this;
    var map = this.get('controllers.map.map');
    console.log("gps location");
    return new Promise(function (resolve, fail) {
      geoLoc().then(function (position) {
        var lat = parseFloat(position.coords.latitude);
        var lon = parseFloat(position.coords.longitude);
        var center = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
        var view = map.getView();
        view.setCenter(center);
        view.setZoom(16);
        var options = {
          style: consts.style[consts.LOCATION],
          key: "PointType",
          value: "GPS",
          label: "",
          location: center,
          removeFeature: me.get('gpsPoint')
        };
        me.command.send('map.draw.point', options,
          function (feature) {
            me.set('gpsPoint', feature);
            resolve(feature);
          },
          function (reason) {
            console.log(reason);
            fail(feature);
          });
      });
    });
  },

  actions: {
    findLocation: function () {
      this.command.send('actions.map.location.find');
    },
    gpsLocation: function () {
      this.command.send('actions.map.location.gps.watch');
    },
    locateOnMap: function () {
      this.command.send('actions.map.location.coordinates');
    }
  }

})
  ;
