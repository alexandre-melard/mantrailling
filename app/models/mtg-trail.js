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
  level: DS.belongsTo('mtgLevel', {async: true}),
  items: DS.hasMany('mtgItem', {async: true}),
  Trailer: DS.belongsTo('mapLinestring', {async: true, inverse: 'trail'}),
  Team: DS.belongsTo('mapLinestring', {async: true, inverse: 'trail'}),
  mapDraw: DS.belongsTo('mapDraw', {async: true}),
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
    return Promise.all(
      [me.get('mapDraw').then(function (mapDraw) {
        if (mapDraw !== null) {
          mapDraw.load(layer);
        }
      })].concat([consts.TRAILER, consts.TEAM].map(function (type) {
          me.get(type).then(function (item) {
            if (item !== null) {
              return item.loadGPX(layer);
            }
          });
        })));
  },
  export: function () {
    var me = this;
    var layer = this.layer;
    return Promise.all(
      [me.get('mapDraw').then(function (mapDraw) {
        if (mapDraw !== null) {
          mapDraw.export();
        }
      })].concat([consts.TRAILER, consts.TEAM].map(function (type) {
          me.get(type).then(function (item) {
            if (item !== null) {
              return item.exportToGPX();
            }
          });
        })));
  },
  import: function () {
    var me = this;
    var layer = this.layer;
    return Promise.all(
      [consts.TRAILER, consts.TEAM].map(function (type) {
        me.get(type).then(function (item) {
          if (item !== null) {
            return item.importGPX(layer, null, {type: type});
          }
        });
      }));
  }
});

export default Trail;


