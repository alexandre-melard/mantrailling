import Ember from 'ember';

export default Ember.Component.extend({
  classNames: "map-data",
  map: null,

  center: function() {
    return this.mapService.get('center');
  },

  loadMap: function() {
    this.mapService.addObserver('map', this, function(sender) {
      this.set('map', sender.get('map'));
    });
  }.on('init')
});
