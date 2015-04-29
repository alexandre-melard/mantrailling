import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  address: DS.attr('string'),
  level: DS.belongsTo('mtgLevel'),
  items: DS.hasMany('mtgItem', { async: true }),
  features: DS.attr('string'),
  selected: DS.attr('boolean', {defaultValue: false}),
  createdAt: DS.attr('string', {
    defaultValue: function() { return new Date(); }
  })
});
