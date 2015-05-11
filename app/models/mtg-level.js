import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  index: DS.attr('number'),
  selected: DS.attr('boolean', {defaultValue: false})
});
