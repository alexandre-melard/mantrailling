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

  bindCommand: function () {
    var me = this;
    this.command.register(this, 'save', function (options) {
      return new Promise(function (resolve) {
        console.log("saving drawings");
        me.save();
        resolve(true);
      });
    });
    this.command.register(this, 'mtg.draw.remove', function (options) {
      return new Promise(function (resolve) {
        if (options.id === me.id) {
          console.log("removing all drawings");
          me.deleteRecord();
          resolve(true);
        }
      });
    });
  }.on('init'),

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

  serialize: function() {
    this.export();
    var data = {};
    var me = this;
    ['lineStrings', 'points', 'polygons'].forEach(function (type) {
      data[type] = [];
      var items = me.get(type);
      if (items !== null) {
        items.forEach(function (item) {
          data[type].pushObject(item.get('geoJSON'));
        });
      }
    });
    return JSON.stringify(data);
  },

  remove: function (feature) {
    var me = this;
    this.get('points').forEach(function (item) {
      me.command.send("map.feature.remove", {feature: item.feature});
    });
    this.get('polygons').forEach(function (item) {
      me.command.send("map.feature.remove", {feature: item.feature});
    });
    this.get('lineStrings').forEach(function (item) {
      me.command.send("map.feature.remove", {feature: item.feature});
    });
  }
});

export default MapDraw;


