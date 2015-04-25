import DS from 'ember-data';

/**
 * Created by alex on 31/03/2015.
 */
let Trail = DS.Model.extend({
  name: DS.attr('string'),
  address: DS.attr('string'),
  date: DS.attr('date'),
  level: DS.attr('string'),
  itemAtPoints: DS.hasMany('mtgItemAtPoint', { async: true }),
  features: DS.attr('string'),
  selected: DS.attr('boolean', {defaultValue: false}),
  createdAt: DS.attr('string', {
    defaultValue: function() { return new Date(); }
  })
});
export default Trail;


