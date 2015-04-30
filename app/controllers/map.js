/**
 * Created by a140980 on 30/04/2015.
 */
import Ember from 'ember';

export default Ember.Controller.extend({
  trail: null,
  layers: null,
  trails: null,
  levels: null,

  setSelectedTrail: function() {
    var me = this;
    this.store.find('mtgTrail', {selected: true}).then(function (trails) {
      me.set('trail', trails.get('firstObject'));
    });

  },

  setup: function () {
    this.setSelectedTrail();
    this.set('layers', this.store.find('mapLayer'));
    this.set('trails', this.store.find('mtgTrail'));
    this.set('levels', this.store.find('mtgLevel'));
  }.on('init'),

  handleTrailSelection: function () {
    if (this.get('trails') !== null) {
      this.setSelectedTrail();
    }
  }.observes('trails.@each.selected'),


  actions: {
    broadcastEvent: function (name, value) {
      console.log("received broadcastEvent: " + name);
      if (name === 'trail.selected') {
        console.log("received broadcastEvent trail's name: " + value.get('name'));
      }
    }
  }
});
