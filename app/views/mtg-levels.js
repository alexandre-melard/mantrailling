/**
 * Created by alex on 04/04/2015.
 */
import Ember from 'ember';

export default Ember.View.extend({
  templateName: "mtgLevels",
  classNames: ["mtg-levels btn-group"],
  loadLevels: function() {
    this.get('controller').get('levels').forEach(function(level) {
      level.set('selected', false);
    });
    this.get('controller').get('selectedTrail').get('level').set('selected', true);
  }.on('didInsertElement')
});
