/**
 * Created by alex on 07/04/2015.
 */
import Ember from 'ember';

export default Ember.Handlebars.makeBoundHelper(function(str, length) {
  if (str.length > length) {
    str = str.substring(0, length);
    str += "...";
  }
  return str;
});
