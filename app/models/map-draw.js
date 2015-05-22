import DS from 'ember-data';

/**
 * Created by alex on 31/03/2015.
 */
let MapDraw = DS.Model.extend({
  map: null,
  layer: null,
  lineStrings: DS.hasMany('mapLinestring', {async: false}),
  points: DS.hasMany('mapPoint', {async: false}),
  polygons: DS.hasMany('mapPolygon', {async: false}),
  createdAt: DS.attr('string', {
    defaultValue: function () {
      return new Date();
    }
  }),
  load: function (layer) {
    var me = this;
    return Promise.all(
      ['lineStrings', 'points', 'polygons'].map(function (type) {
        var items = me.get(type);
        if (items !== null) {
          items.forEach(function (item) {
            return item.loadGeoJSON(layer);
          });
        }
      }));
  },
  export: function () {
    var me = this;
    return Promise.all(
      ['lineStrings', 'points', 'polygons'].map(function (type) {
        var items = me.get(type);
        if (items !== null) {
          items.forEach(function (item) {
            item.exportGeoJSON();
            return item;
          });
        }
      }));
  },

  remove: function (feature) {
    this.get('points').forEach(function (item) {
      if (item.feature.getId() === feature.getId()) {
        item.destroyRecord();
      }
    });
    this.get('polygons').forEach(function (item) {
      if (item.feature.getId() === feature.getId()) {
        item.destroyRecord();
      }
    });
    this.get('lineStrings').forEach(function (item) {
      if (item.feature.getId() === feature.getId()) {
        item.destroyRecord();
      }
    });
  },

  save: function () {
    var me = this;
    return Promise.all(me.get('lineStrings').map(function (ls) {
        return ls.save();
      }).concat(me.get('points').map(function (p) {
        return p.save();
      })).concat(me.get('polygons').map(function (p) {
        return p.save();
      })).concat(me._super())
    );
  }

});

export default MapDraw;


