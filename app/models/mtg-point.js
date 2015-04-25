/**
 * Created by alex on 31/03/2015.
 */
import DS from 'ember-data';

export default DS.Model.extend({
  long: DS.attr('string'),
  lat: DS.attr('string')
});
