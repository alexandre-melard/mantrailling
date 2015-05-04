/**
 * Created by alex on 22/04/2015.
 */
import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    positionItem: function (item) {
      var options = {
        radius: 10,
        color: "#0000ff",
        opacity: "0.3",
        key: "PointType",
        value: "GPS",
        label: "",
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
