import Ember from 'ember';

export default Ember.Component.extend({
  classNames: "map-data-weather",

  mydate: null,

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
    FeelsLikeC : null
  },


  loadWeather: function() {
    var me = this;
    var center = this.get('center');
    var time = this.get('selectedTime');
    var date = this.get('mydate');
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

  initTime: function() {
    for (var i = 0; i < 8; i++) {
      this.get('time').pushObject({
        key: i,
        value: this.pad((i * 3),2) + "h -> " + this.pad(((i+1) * 3),2) + "h"
      });
    }
  }.on("init"),

  actions: {
    checkWeather: function() {
      this.loadWeather();
    }
  }
});