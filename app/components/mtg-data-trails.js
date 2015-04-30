import Ember from 'ember';

export default Ember.Component.extend({
  name: null,
  trails: [], //injected by the mtg-data component

  trail: function() {
    var trails = this.get('trails');
    for (var i=0; i < trails.get('length'); i++) {
      var trail = trails.objectAt(i);
      if (trail.get('selected')) {
        return trail;
      }
    }
    return false;
  }.property('trails.@each.selected'),

  index: function() {
    return this.get('trails').get('length');
  }.property('trails.@each'),

  actions: {
    addTrail: function() {
      this.trailService.addTrail(this.name);
    }
  }
});
