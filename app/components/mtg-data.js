import Ember from 'ember';

export default Ember.Component.extend({
  classNames: "mtg-data",
  trails: [],
  levels: [],

  loadLevels: function() {
    var me = this;
    this.levelService.getLevels().then(function(levels) {
      me.set('levels',levels);
    });
  }.on('init'),

  loadTrails: function() {
    var me = this;
    this.trailService.getTrails().then(function(trails){
      me.set('trails',trails);
    });
  }.on('init')

});
