/**
 * Created by alex on 22/04/2015.
 */
import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    positionItem: function (item) {
      var options = {
        radius: 15,
        color: "#00aa00",
        opacity: "0.3",
        key: "PointType",
        value: "Item",
        label: item.get('index') + item.get('position'),
        removeFeature: item.get("feature"),
        success: function (feature) {
          item.set("feature", feature);
        },
        failure: function (reason) {
          console.log('could not create item icon: ' + reason);
        }
      };
      this.command.send({
          key: 'map.draw.point',
          value: options
        }
      );
    }
  }
});
