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
      var me = this;
      return new Promise(function (resolve) {
        if (options.id === me.id) {
          console.log("removing all drawings");
          ['lineStrings', 'points', 'polygons'].forEach(function(typeArray) {
            me.get(typeArray).forEach(function(type) {
              me.command.send("map.feature.remove", {feature: type.feature});
            });
          });
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
  import: function (json) {
    var me = this;
    var lineStrings = json[type];
    if (lineStrings !== undefined && lineStrings !== null) {
      lineStrings.forEach(function (lineString) {
        me.store.find('mapLinestring', lineString.id).then(function (lineString) {
          me.get('lineStrings').pushObject(lineString);
        }, function () {
          var lineString = me.store.createRecord('mapLinestring', lineString);
          me.get('lineStrings').pushObject(lineString);
          lineString.save();
        });
      });
    }
    var points = json[type];
    if (points !== undefined && points !== null) {
      points.forEach(function (pointJSON) {
        me.store.find('mapPoint', pointJSON.id).then(function (point) {
          me.get('points').pushObject(point);
        }, function () {
          var pointRecord = me.store.createRecord('mapPoint');
          pointRecord.importGeoJSON(me.get('layer'), pointJSON);
          me.get('points').pushObject(pointRecord);
          pointRecord.save();
        });
      });
    }
    var polygons = json[type];
    if (polygons !== undefined && polygons !== null) {
      polygons.forEach(function (polygon) {
        me.store.find('mapPolygon', polygon.id).then(function (polygon) {
          me.get('polygons').pushObject(polygon);
        }, function () {
          var polygon = me.store.createRecord('mapPolygon', polygon);
          me.get('polygons').pushObject(polygon);
          polygon.save();
        });
      });
    }
    return this;
  },

  serialize: function () {
    this.export();
    var data = {};
    data.id = this.id;
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
    return data;
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


