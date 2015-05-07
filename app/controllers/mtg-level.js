/**
 * Created by alex on 22/04/2015.
 */
import Ember from 'ember';

export default Ember.Controller.extend({
  selected: function() {
    var level = this.get('model');
    return level.name === this.get('trail').get('level').get('name');
  }.property('trail.level')
});
