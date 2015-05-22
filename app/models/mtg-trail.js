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

  remove: function (feature) {
    var me = this;
    return new Promise(function (resolve) {
      if (me.get('Trailer') !== null && me.get('Trailer').feature.getId() === feature.getId()) {
        me.get('Trailer').deleteRecord();
      } else if (me.get('Team') !== null && me.get('Team').feature.getId() === feature.getId()) {
        me.get('Team').deleteRecord();
      } else if (me.get('mapDraw') !== null) {
        me.get('mapDraw').remove(feature);
      }
      resolve(true);
    });
  },

  save: function () {
    var me = this;
    return Promise.all(['Trailer', 'Team', 'mapDraw'].map(function (type) {
        if (me.get(type) !== null) {
          return me.get(type).save();
        }
      }).concat(me.get('items').map(function (item) {
        if (me.get(item) !== null) {
          return me.get(item).save();
        }
      })).concat(me._super())
    );
  }
});

export default Trail;


