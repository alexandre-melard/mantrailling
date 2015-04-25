/**
 * Created by alex on 06/04/2015.
 */
import Ember from 'ember';

export default Ember.Controller.extend({
  visible: function(key, value){
    var model = this.get('model');

    if (value === undefined) {
      // property being used as a getter
      return model.get('visible');
    } else {
      // property being used as a setter
      model.set('visible', value);
      model.get('layer').setVisible(value);
      model.save();
      return value;
    }
  }.property('model.visible'),

  opacity: function(key, value){
    var model = this.get('model');

    if (value === undefined) {
      // property being used as a getter
      console.log("get layer opacity: " + model.get('opacity'));
      return model.get('opacity') * 100;
    } else {
      // property being used as a setter
      model.set('opacity', value / 100);
      model.get('layer').setOpacity(value / 100);
      model.save();
      return value;
    }
  }.property('model.opacity')
});
