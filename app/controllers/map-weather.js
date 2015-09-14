/**
 * Created by alex on 04/04/2015.
 */
import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";

export default Ember.Controller.extend({

  needs: ['map'],
  map: null,
  date: null,
  time: [],
  selectedTime: null,
  error: function() {
    return this.get('i18n').t("map.weather.result.tips");
  }.property(),
  weather: {
    tempC: null,
    winddir16Point: null,
    winddirDegree: null,
    windspeedKmph: null,
    weatherCode: null,
    weatherIconUrl: null,
    precipMM: null,
    humidity: null,
    visibility: null,
    pressure: null,
    cloudcover: null,
    FeelsLikeC: null,
  },

  isVisible: Ember.computed('weather', {
    get: function () {
      return (!Ember.isEmpty(this.weather.tempC));
    }
  }),

  bindActions: function () {
    var me = this;
    this.command.register(this, 'actions.map.weather.load', function (options) {
      return new Promise(function (resolve, fail) {
        me.command.send('map.weather.load', options, function (result) {
          me.command.send('map.weather.loaded', options, resolve);
          me.set('weather', result);
          me.set('error', null);
          resolve(result);
        }, function (reason) {
          console.log('failed loading weather: ' + reason);
          me.set('weather', null);
          me.set('error', me.get('i18n').t("map.weather.result.error"));
          fail(reason);
        });
      });
    });
  }.on('init'),

  bindCommand: function () {
    this.command.register(this, 'map.weather.load', this.loadWeather);
  }.on('init'),

  loadWeather: function (options) {
    var center = ol.proj.transform(this.map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326');
    var time = options.time;
    var date = options.date;
    var me = this;
    return new Promise(function (resolve, fail) {
      $.ajax({
        url: "http://api.worldweatheronline.com/free/v2/past-weather.ashx",

        // The name of the callback parameter, as specified by the YQL service
        jsonp: "callback",

        // Tell jQuery we're expecting JSONP
        dataType: "jsonp",

        // Tell YQL what we want and that we want JSON
        data: {
          key: "4ade74420c51c89bdb66153847cd2",
          format: "json",
          q: center[1] + "," + center[0],
          tp: 1,
          date: date
        },

        // Work with the response
        success: function (response) {
          if (!Ember.isEmpty(response.data.weather)) {
            var result = response.data.weather.get("firstObject").hourly[time.key];
            result.weatherIconUrl = result.weatherIconUrl.get("firstObject").value;
            var rotation = result.winddirDegree;
            $(".wind-direction").find("img").rotate(rotation - 270);
            resolve(result);
          } else {
            fail('no data');
          }
        },

        statusCode: {
          400: function () {
            fail("bad request");
          }
        }
      });
    });
  },

  pad: function (num, size) {
    var s = "000000000" + num;
    return s.substr(s.length - size);
  },

  init: function () {
    this._super();
    for (var i = 0; i < 8; i++) {
      this.time.pushObject({
        key: i,
        value: this.pad((i * 3), 2) + "h -> " + this.pad(((i + 1) * 3), 2) + "h"
      });
    }
    this.get('controllers.map').addObserver('map', this, function (sender) {
      this.set('map', sender.get('map'));
    });
  },

  actions: {
    checkWeather: function () {
      this.command.send('actions.map.weather.load', {date: this.date, time: this.selectedTime});
    }
  }

});
