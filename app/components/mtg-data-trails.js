import Ember from 'ember';

export default Ember.Component.extend({
  name: null,
  trails: [], //injected by the mtg-data component

  index: function() {
    return this.get('trails').get('length');
  }.property('trails.@each'),

  actions: {
    addTrail: function() {
      this.trailService.addTrail(this.name);
    }
  }
});
