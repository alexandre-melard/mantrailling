import Ember from 'ember';

export default Ember.Component.extend({
  classNames: "mtg-data-trail",
trail: null, // injected by the map-data-trails component

  actions: {
  updateTrail: function() {
    this.trailService.updateTrail(this.get('trail'));
  },

  deleteTrail: function() {
    this.trailService.deleteTrail(this.get('trail'));
  }
}
});
