/**
 * Created by alex on 04/04/2015.
 */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['btn-group', 'dropdown-list'],
  isDropdownVisible: false,
  img: false,
  icon: false,
  resetView: "true",

  glyphicon: function () {
    return "glyphicon-" + this.get('icon');
  }.property('icon'),

  btnRadius: function() {
    return this.get('btn-radius');
  }.property('btn-radius'),

  btnClassName: function () {
    return 'btn-' + this.get('item').replace("-icon", "");
  }.property('item'),

  btnColorName: function () {
    if (this.get('color')) {
      return 'btn-' + this.get('color');
    } else {
      return "btn-default";
    }
  }.property('color'),

  actions: {
    toggle: function () {
      this.set('isDropdownVisible', this.$(".dropdown-menu").parent().hasClass("visible"));

      // Reset views
      $(".dropdown-menu").parent().removeClass("visible");
      $(".dropdown-menu").parent().addClass("hidden");

      // Set dropdown to visible
      var parents;
      if (!this.get('isDropdownVisible')) {
        parents = this.$(".dropdown-menu:first").parents(".dropdown-menu");
        parents.each(function () {
          $(this).parent().removeClass("hidden");
          $(this).parent().addClass("visible");
        });
        this.$(".dropdown-menu:first").parent().removeClass("hidden");
        this.$(".dropdown-menu:first").parent().addClass("visible");
      } else {
        this.$(".dropdown-menu:first").parent().removeClass("visible");
        this.$(".dropdown-menu:first").parent().addClass("hidden");
        parents = this.$(".dropdown-menu:first").parents(".dropdown-menu");
        parents.each(function (parent) {
          $(this).parent().removeClass("hidden");
          $(this).parent().addClass("visible");
        });
      }
    }
  }
});
