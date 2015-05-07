import DS from 'ember-data';

/**
 * Created by alex on 31/03/2015.
 */
let Trail = DS.Model.extend({
  name: DS.attr('string'),
  address: DS.attr('string'),
  level: DS.belongsTo('mtgLevel', { async: true }),
  items: DS.hasMany('mtgItem', { async: true }),
  features: DS.attr('string'),
  selected: DS.attr('boolean', {defaultValue: false}),
  createdAt: DS.attr('string', {
    defaultValue: function() { return new Date(); }
  })
});
export default Trail;


