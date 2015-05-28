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
    this.command.register(this, 'save', function (options) {
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
      var item = me.get(type)
      if (item !== null) {
        return item.loadGPX(layer);
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
      var item = me.get(type)
      if (item !== null) {
        return item.exportToGPX();
      }
    });
  },

  import: function (data, layer, map) {
    var me = this;
    this.layer = layer;
    this.map = map;
    var json = JSON.parse(data);
    this.set("version", json.version);
    this.set("name", json.name);
    this.set("selected", true);
    this.set("level", this.store.find('mtgLevel', {name: json.level}));

    json.items.forEach(function(i) {
      var item = me.store.createRecord('mtgItem', i);
      item.save();
      me.get('items').pushObject(item);
    });
    this.set("items", json.items);

    this.set('mapDraw', this.store.createRecord('mapDraw'));
    this.get('mapDraw').import(json.mapDraw);

    this.set('Trailer', this.store.createRecord('mapLinestring'));
    this.get('Trailer').import(json.Trailer);

    this.set('Team', this.store.createRecord('mapLinestring'));
    this.get('Team').import(json.Team);
  },

  serialize: function() {
    var me = this;
    this.export();
    var data = {};

    data.version = this.get("version")
    data.name = this.get("name")
    data.level = this.get("level").get('name');
    this.get("items").forEach(function(i) {
      data.items.pushObject(i.serialize());
    });

    var mapDraw = this.get('mapDraw');
    if (mapDraw !== null) {
      data.mapDraw = mapDraw.serialize();
    }
    [consts.TRAILER, consts.TEAM].map(function (type) {
      var item = me.get(type)
      if (item !== null) {
        data[type] = item.get('gpx');
      }
    });
    return JSON.stringify(data);
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


