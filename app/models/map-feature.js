import DS from 'ember-data';

/**
 * Created by alex on 31/03/2015.
 */
let Feature = DS.Model.extend({

  name: function(key, name, previousValue) {
    // setter
    if (arguments.length > 1) {
      this.get('feature').set('name', name);
    }
    // getter
    return this.get('feature').get('name');
  }.property('feature'),

  address: function(key, adress, previousValue) {
    // setter
    if (arguments.length > 1) {
      this.get('feature').set('adress', adress);
    }
    // getter
    return this.get('feature').get('adress');
  }.property('feature'),

  features: function(key, features, previousValue) {
    // setter
    if (arguments.length > 1) {
      var format = new ol.format.GPX();
      data = format.writeFeatures(features);
      this.set('xmlFeatures', data);
    }
    // getter
    var source = new ol.source.StaticVector({
      format: new ol.format.GPX(),
      projection: 'EPSG:3857'
    });
    return source.readFeatures(this.get('xmlFeatures'));
  }.property('xmlFeatures'),
  xmlFeatures: DS.attr('string'),
  items: DS.hasMany('mtgItem', { async: true }),
   length: DS.attr('number', {defaultValue: 0}),
  location: DS.attr('string'),
  createdAt: DS.attr('string', {
    defaultValue: function() { return new Date(); }
  })
});
export default Features;


