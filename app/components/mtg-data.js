import Ember from 'ember';

export default Ember.Component.extend({
  classNames: "mtg-data",
  //attributeBindings: ['trails', 'levels'],
  //trails: [],
  //levels: [],

  //loadLevels: function() {
  //  var me = this;
  //  this.levelService.getLevels().then(function(levels) {
  //    me.set('levels',levels);
  //  });
  //}.on('didInsertElement'),
  //
  loadTrails: function() {
    var me = this;
    console.log('trails: ' + this.get('trails'));
    //this.trailService.getTrails().then(function(trails){
    //  me.set('trails',trails);
    //});
  }.on('didInsertElement')

});
