/**
 * Created by alex on 04/04/2015.
 */
import Ember from 'ember';

export default Ember.View.extend({
  templateName: "mapDraw",
  classNames: ["map-draw"],
  didInsertElement: function() {
    this.$().bind('DOMSubtreeModified',function(){
      var $colors = $(".color-picker");
      $.each($colors, function(i, color) {
        $(color).css("background-color", $(color).attr("title"));
      });
    });
  }.on('didInsertElement')
});
