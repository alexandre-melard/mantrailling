/**
 * Created by alex on 04/04/2015.
 */
import Ember from 'ember';

export default Ember.Controller.extend({

  needs: ['map'],
  map: null,
  date: null,
  time: [],
  selectedTime: null,
  error: "You must choose a day and time interval in order to see the weather for the map's center",
  weather: {
    tempC: null,
    winddir16Point: null,
    winddirDegree: null,
    windspeedKmph : null,
    weatherCode : null,
    weatherIconUrl : null,
    precipMM : null,
    humidity : null,
    visibility : null,
    pressure : null,
    cloudcover : null,
    FeelsLikeC : null,
  },

  isVisible: function() {
    return (this.weather.tempC !== null);
  }.property('weather'),

  loadWeather: function() {
    var center = ol.proj.transform(this.map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326');
    var time = this.selectedTime;
    var date = this.date;
    var me = this;
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
      success: function( response ) {
        if (response.data.weather !== undefined) {
          var result = response.data.weather.get("firstObject").hourly[time.key];
          result.weatherIconUrl = result.weatherIconUrl.get("firstObject").value;
          var rotation = result.winddirDegree;
          $(".wind-direction").find("img").rotate(rotation - 270);
          me.set('weather', result);
          me.set('error', null);
        } else {
          me.set('weather', null);
          me.set('error', 'The weather data is not available for the [' + date + '], please wait or choose another day');
        }
      },

      fail: function() {
        me.set('weather', null);
        me.set('error', 'The weather data is not available for the [' + date + '], please wait or choose another day');
      }
    });
  },

  pad: function (num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
  },

  init: function() {
    this._super();
    for (var i = 0; i < 8; i++) {
      this.time.pushObject({
        key: i,
        value: this.pad((i * 3),2) + "h -> " + this.pad(((i+1) * 3),2) + "h"
      });
    }
    this.get('controllers.map').addObserver('map', this, function(sender) {
    this.set('map', sender.get('map'));
    });
  },

  actions: {
    checkWeather: function() {
      this.loadWeather();
    }
  }

});
