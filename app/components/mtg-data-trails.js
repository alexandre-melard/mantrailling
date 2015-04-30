import Ember from 'ember';

export default Ember.Component.extend({
  classNames: "mtg-data-trails",
  name: null,
  trails: [], //injected by the mtg-data component

  /**
   * Return the selected Trail in Trails' array.
   * If trial param is set, set trails to unselected and provided trail to selected.
   * @param trail
   * @param context
   * @returns {*}
   */
  selectedTrail: function(key, value, previousValue) {
    if (this.get('trails').length === 0) {
      console.log("no trail has been defined yet, please create a trail first");
      return false;
    }
    if (arguments.length <= 1) {
      value = this.get('trails').findBy('selected', true);
    } else {
      this.get('trails').forEach(function (t) {
        if (t === value) {
          t.set('selected', true);
        } else {
          t.set('selected', false);
        }
        t.save();
      }, this);
    }
    this.set('broadcastEvent', 'broadcastEvent');
    this.sendAction('broadcastEvent', 'trail.selected', value);
    return value;
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
