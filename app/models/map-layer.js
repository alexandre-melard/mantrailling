import DS from 'ember-data';

export default DS.Model.extend({
  identifier: DS.attr('string'),
  title: DS.attr('string'),
  abstract: DS.attr('string'),
  visible: DS.attr('boolean'),
  opacity: DS.attr(),
  layer: null
});
