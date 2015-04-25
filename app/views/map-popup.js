/**
 * Created by alex on 13/04/2015.
 */
import Ember from 'ember';

export default Ember.View.extend({
  templateName: "mapPopup",
  classNames: ["map-popup"],

  actions: {
    closePopup: function() {
      this.hide();
    }
  }
});
