import DS from 'ember-data';

export default DS.Model.extend({
  index: DS.attr('number'),
  location: DS.attr('string'),
  position: DS.attr('string'),
  type: DS.attr('string'),
  description: DS.attr('string')
});
