/**
 * Created by alex on 31/03/2015.
 */
import DS from 'ember-data';

export default DS.Model.extend({
  index: DS.attr('number'),
  position: DS.attr('string'),
  type: DS.attr('string'),
  description: DS.attr('string')
});
