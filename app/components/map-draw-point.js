import Ember from 'ember';

export default Ember.Component.extend({
  tagName: "button",
  attributeBindings: ['type', 'data-toggle', 'title'],
  type: "button",
  "data-toggle": "tooltip",
  title: "Draw a Point",
  classNames: ["btn btn-danger btn-sm map-draw-point"],

  click: function() {
    this.mapDrawService.drawPoint();
  }
});
