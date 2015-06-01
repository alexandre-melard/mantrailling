import DS from 'ember-data';
import * as consts from '../utils/map-constants.js';

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
      return new Promise(function (resolve) {
        if (options.id === me.id) {
          console.log("removing trail:" + me.get('name'));
          me.deleteRecord();
          resolve(true);
        }
      });
    });
  }.on('init'),

  load: function () {
    var me = this;
    var layer = this.layer;
    if (this.get('version') !== consts.VERSION) {
      console.log("major version change, deleting model");
      localStorage.clear();
      this.set('version', consts.VERSION);
    }
    var mapDraw = this.get('mapDraw');
    if (mapDraw !== null) {
      mapDraw.load(layer);
    }
    [consts.TRAILER, consts.TEAM].map(function (type) {
      var item = me.get(type);
      if (item !== null) {
        item.loadGPX().then(function(feature) {
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
  },

  export: function () {
    var me = this;
    var layer = this.layer;
    var mapDraw = this.get('mapDraw');
    if (mapDraw !== null) {
      mapDraw.export();
    }
    [consts.TRAILER, consts.TEAM].map(function (type) {
      var item = me.get(type);
      if (item !== null) {
        return item.exportToGPX();
      }
    });
  },

  import: function (data, layer, map) {
    var me = this;
    return new Promise(function (resolve) {
      me.layer = layer;
      me.map = map;
      var json = JSON.parse(data);
      me.set("version", json.version);
      me.set("name", json.name);
      me.set("selected", true);

      json.levels.forEach(function (l) {
        me.store.find('mtgLevel', l.id).then(function(){}, function () {
          // Create level if not exists
          var level = me.store.createRecord('mtgLevel', l);
          level.save();
        }).finally(function () {
          me.set("level", me.store.find('mtgLevel', {name: json.level}));

          json.items.forEach(function (i) {
            me.store.find('mtgItem', i.id).then(function(){}, function () {
              var item = me.store.createRecord('mtgItem', i);
              item.save();
              me.get('items').pushObject(item);
            });
          });

          me.set('mapDraw', me.store.createRecord('mapDraw'));
          me.get('mapDraw').import(json.mapDraw);

          me.set('Trailer', me.store.createRecord('mapLinestring'));
          me.get('Trailer').import(json.Trailer);

          me.set('Team', me.store.createRecord('mapLinestring'));
          me.get('Team').import(json.Team);
          resolve(this);
        });
      });
    });
  },

  serialize: function() {
    var me = this;
    return new Promise(function (resolve) {
      me.export();
      var data = {};

      data.version = me.get("version");
      data.name = me.get("name");
      data.level = me.get("level").get('name');
      data.levels = [];
      me.store.find("mtgLevel").then(function (levels) {
        levels.forEach(function (l) {
          data.levels.pushObject(l.serialize());
        });
      }).finally(function () {
        data.items = [];
        me.get("items").forEach(function (i) {
          data.items.pushObject(i.serialize());
        });

        var mapDraw = me.get('mapDraw');
        if (mapDraw !== null) {
          data.mapDraw = mapDraw.serialize();
        }
        [consts.TRAILER, consts.TEAM].map(function (type) {
          var item = me.get(type);
          if (item !== null) {
            data[type] = item.get('gpx');
          }
        });
        resolve(JSON.stringify(data));
      });
    });
  },

  remove: function (feature) {
    var me = this;
    return new Promise(function (resolve) {
      if (me.get('Trailer') !== null && me.get('Trailer').feature.getId() === feature.getId()) {
        me.command.send("map.feature.remove", {feature: me.get('Trailer').feature});
      } else if (me.get('Team') !== null && me.get('Team').feature.getId() === feature.getId()) {
        me.command.send("map.feature.remove", {feature: me.get('Team').feature});
      } else if (me.get('mapDraw') !== null) {
        me.command.send("mtg.draw.remove", {id: me.get('mapDraw').id});
      }
      resolve(true);
    });
  }
});

export default Trail;


