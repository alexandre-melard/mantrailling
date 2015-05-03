import Ember from 'ember';

export default Ember.Service.extend({
  mapDraw: null,

  register: function(mapDraw) {
    this.set('mapDraw', mapDraw);
  },

  drawPoint: function(options) {
    return this.get('mapDraw').drawPoint(options);
  }
});
