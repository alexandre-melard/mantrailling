/**
 * Created by alex on 22/04/2015.
 */
import Ember from 'ember';

export default Ember.Controller.extend({
  isPositionDisabled: false,
  actions: {
    positionItem: function (item) {
      var me = this;
      var options = {
        radius: 15,
        color: "#ffffff",
        key: "PointType",
        value: "Item",
        label: item.get('index') + item.get('position')
      };
      if (item.get('feature') === undefined || item.get('feature') === null) {
        this.mapDrawService.drawPoint(options).then(function(feature) {
          item.set("feature", feature);
          me.set('isPositionDisabled', true);
        });
      }
    }
  }
});
