import DS from 'ember-data';

/**
 * Created by alex on 31/03/2015.
 */
let MapDraw = DS.Model.extend({
  map: null,
  layer: null,
  lineStrings: DS.hasMany('mapLinestring', {async: true}),
  points: DS.hasMany('mapPoint', {async: true}),
  polygons: DS.hasMany('mapPolygon', {async: true}),
  createdAt: DS.attr('string', {
    defaultValue: function () {
      return new Date();
    }
  }),
  load: function (layer) {
    var me = this;
    return Promise.all(
      ['lineStrings', 'points', 'polygons'].map(function (type) {
        me.get(type).then(function (items) {
          if (items !== null) {
            items.forEach(function (item) {
              return item.loadGeoJSON(layer);
            });
          }
        });
      }));
  },
  export: function () {
    var me = this;
    return Promise.all(
      ['lineStrings', 'points', 'polygons'].map(function (type) {
        me.get(type).then(function (items) {
          if (items !== null) {
            items.forEach(function (item) {
              item.exportGeoJSON();
              item.save();
              return item;
            });
          }
        });
      }));
  },
  import: function () {
    var me = this;
    return Promise.all(
      ['lineStrings', 'points', 'polygons'].map(function (type) {
        me.get(type).then(function (items) {
          if (items !== null) {
            items.forEach(function (item) {
              item.importGeoJSON(null, {type: type});
              return item;
            });
          }
        });
      }));
  }
});

export default MapDraw;


