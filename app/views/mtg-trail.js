/**
 * Created by alex on 04/04/2015.
 */
import Ember from 'ember';

export default Ember.View.extend({
  templateName: "mtgTrail",
  classNames: ["mtg-trail", "btn-group"],
  onInit: function() {
    this.$('.editable').editable({
      toggle: 'manual',
      mode: 'inline',
      success: function (response, newValue) {
        console.log("renamed item:" + newValue);
      }
    });
  }.on('didInsertElement')
});