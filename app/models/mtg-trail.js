import DS from 'ember-data';
import * as consts from '../utils/map-constants';
import Ember from 'ember';

/**
 * Created by alex on 31/03/2015.
 */
let Trail = DS.Model.extend({
  map: null,
  layer: null,
  version: DS.attr('string', {defaultValue: consts.VERSION}),
  name: DS.attr('string'),
  selected: DS.attr('boolean', {defaultValue: false}),
  level: DS.belongsTo('mtgLevel', {async: false}),
  items: DS.hasMany('mtgItem', {async: false}),
  Trailer: DS.belongsTo('mapLinestring', {async: false}),
  Team: DS.belongsTo('mapLinestring', {async: false}),
  mapDraw: DS.belongsTo('mapDraw', {async: false}),
  createdAt: DS.attr('string', {
    defaultValue: function () {
      return new Date();
    }
  }),

  bindCommand: function () {
    var me = this;
    me.command.register(this, 'save', function (options) {
      return new Promise(function (resolve) {
        console.log("saving map layers");
        me.save();
        resolve(true);
      });
    });
    this.command.register(this, 'mtg.trail.remove', function (options) {
      var me = this;
      var layer = options.layer;
      var id = options.id;
      var map = options.map;
      return new Promise(function (resolve) {
        if (id === me.id) {
          console.log("removing trail:" + me.get('name'));
          if (!Ember.isEmpty(layer) && !Ember.isEmpty(map)) {
            map.removeLayer(layer);
          }
          if (!Ember.isEmpty(me.get('Trailer')) && !Ember.isEmpty(me.get('Trailer').feature)) {
            me.command.send("map.feature.remove", {feature: me.get('Trailer').feature});
          }
          if (!Ember.isEmpty(me.get('Team')) && !Ember.isEmpty(me.get('Team').feature)) {
            me.command.send("map.feature.remove", {feature: me.get('Team').feature});
          }
          if (!Ember.isEmpty(me.get('mapDraw'))) {
            me.command.send("mtg.draw.remove", {id: me.get('mapDraw').id});
          }
          //TODO montrer ça à un expert !
          me.deleteRecord();
          if (!Ember.isEmpty(me.get('items'))) {
            Promise.all(me.get("items").map(function (i) {
              me.command.send("mtg.item.remove", {id: i.id, layer: layer}, function() {
                console.log("item deleted");
                return true;
              }, function(e) {
                console.log("failed to delete item with reason: " + e);
                return false;
              });
            }));
          }
          resolve(true);
        }
      });
    });
  }.on('init'),

  load: function () {
    var me = this;
    var promises = [];
    var layer = this.layer;
    if (this.get('version') !== consts.VERSION) {
      console.log("major version change, deleting model");
      //TODO gerer les montées de version
      localStorage.clear();
      location.reload();
    }
    if (!Ember.isEmpty(me.get('items'))) {
      me.get("items").forEach(function (i) {
        promises.pushObject(i.load(me.get('layer')));
      });
    }
    var mapDraw = this.get('mapDraw');
    if (!Ember.isEmpty(mapDraw)) {
      promises.pushObject(mapDraw.load(layer));
    }
    [consts.TRAILER, consts.TEAM].map(function (type) {
      var item = me.get(type);
      if (!Ember.isEmpty(item)) {
        var loadGPXPromise = item.loadGPX();
        promises.pushObject(loadGPXPromise);
        loadGPXPromise.then(function (feature) {
          feature.get('extensions').type = type;

          // add the feature to the feature's layer
          layer.getSource().addFeature(feature);

          // Mise à jour de la longueur de piste
          me.command.send("map.linestring.change", {feature: feature});

          var options = {
            layer: layer
          };
          me.command.send('map.view.extent.fit', options);

        });
      }
    });
    return Promise.all(promises);
  },

  export: function () {
    var me = this;
    var layer = this.layer;
    var mapDraw = this.get('mapDraw');
    if (!Ember.isEmpty(mapDraw)) {
      mapDraw.export();
    }
    [consts.TRAILER, consts.TEAM].map(function (type) {
      var item = me.get(type);
      if (!Ember.isEmpty(item)) {
        return item.exportToGPX();
      }
    });
  },

  unserialize: function (json) {
    var me = this;
    return new Promise(function (resolve) {
      var layer = me.layer;

      me.set("version", json.version);
      me.set("name", json.name);
      me.set("selected", true);

      json.levels.forEach(function (l) {
        if (!Ember.isEmpty(l.name) && !Ember.isEmpty(l.index)) {
          me.store.query('mtgLevel', {name: l.name}).then(function () {
          }, function () {
            // Create level if not exists
            me.command.send('mtg.levels.create', {name: l.name, index: l.index}, function(level) {
              level.save();
            });
          }).finally(function () {
            me.set("level", me.store.query('mtgLevel', {name: json.level}));
          });
        }
      });
      json.items.forEach(function (i) {
        me.store.query('mtgItem', i.id).then(function (item) {
          me.get('items').pushObject(item);
        }, function () {
          var item = me.store.createRecord('mtgItem');
          item.unserialize(i, layer);
          item.save();
          me.get('items').pushObject(item);
        });
      });
      if (!Ember.isEmpty(json.mapDraw)) {
        me.store.query('mapDraw', json.mapDraw.id).then(function (mapDraw) {
          me.set('mapDraw', mapDraw);
        }, function () {
          var mapDraw = me.store.createRecord('mapDraw');
          mapDraw.import(json.mapDraw);
          mapDraw.save();
          me.set('mapDraw', mapDraw);
        });
      }
      [consts.TRAILER, consts.TEAM].map(function (type) {
        if (!Ember.isEmpty(json[type])) {
          me.store.query('mapLinestring', json[type].id).then(function (mapLinestring) {
            me.set(type, mapLinestring);
          }, function () {
            var mapLinestring = me.store.createRecord('mapLinestring');
            mapLinestring.importGPX(json[type].gpx, consts.style[type]).then(function (feature) {
              feature.get('extensions').type = type;

              // add the feature to the feature's layer
              layer.getSource().addFeature(feature);

              // Mise à jour de la longueur de piste
              me.command.send("map.linestring.change", {feature: feature});

              var options = {
                layer: layer
              };
              me.command.send('map.view.extent.fit', options);
            });
            mapLinestring.save();
            me.set(type, mapLinestring);
          });
        }
      });
      resolve(me);
    });
  },

  serialize: function () {
    var me = this;
    return new Promise(function (resolve) {
      me.export();
      var data = {};
      data.id = me.id;
      data.version = me.get("version");
      data.name = me.get("name");
      data.level = me.get("level").get('name');
      data.levels = [];
      me.store.query("mtgLevel").then(function (levels) {
        levels.forEach(function (l) {
          data.levels.pushObject(l.serialize());
        });
      }).finally(function () {
        data.items = [];
        me.get("items").forEach(function (i) {
          data.items.pushObject(i.serialize());
        });

        var mapDraw = me.get('mapDraw');
        if (!Ember.isEmpty(mapDraw)) {
          data.mapDraw = mapDraw.serialize();
        }
        [consts.TRAILER, consts.TEAM].map(function (type) {
          var item = me.get(type);
          if (!Ember.isEmpty(item)) {
            data[type] = {id: item.id, gpx: item.get('gpx')};
          }
        });
        resolve(JSON.stringify(data));
      });
    });
  }
});

export default Trail;


