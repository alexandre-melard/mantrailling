/**
 * Created by alex on 07/04/2015.
 */
import Ember from 'ember';

export default Ember.TextField.extend({
  type: 'range',

  action: 'mouseUp',

  mouseUp: function () {
    var value = this.get('value');
    this.sendAction('action', value);
  }
});
