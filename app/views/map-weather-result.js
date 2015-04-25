/**
 * Created by alex on 05/04/2015.
 */
import Ember from 'ember';

export default Ember.View.extend({
  tagName: "tbody",
  templateName: "mapWeatherResult",
  classNames: ["map-weather-result"],
  classNameBindings: ['isVisible'],

  isVisible: function() {
    if(this.get('controller').get('isVisible')) {
      return "visible";
    } else {
      return "hidden";
    }
  },

  onDraw: function() {
    var rotation = this.get('controller.weather.winddirDegree');
    $(".wind-direction").find("img").rotate(rotation - 270);
  }.on('didInsertElement')
});
