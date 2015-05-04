/**
 * Created by alex on 04/05/2015.
 */
import DS from 'ember-data';

export default DS.Model.extend({
  key: DS.attr(),
  options: DS.attr()
});
