import DS from 'ember-data';
import * as consts from '../utils/map-constants.js';

/**
 * Created by alex on 31/03/2015.
 */
let Trail = DS.Model.extend({
  map: null,
  layer: null,
  name: DS.attr('string'),
  selected: DS.attr('boolean', {defaultValue: false}),
  level: DS.belongsTo('mtgLevel', {async: true}),
  items: DS.hasMany('mtgItem', {async: true}),
  Trailer: DS.belongsTo('mapLinestring', {async: true}),
  Team: DS.belongsTo('mapLinestring', {async: true}),
  mapDraw: DS.belongsTo('mapDraw', {async: true}),
  createdAt: DS.attr('string', {
    defaultValue: function () {
      return new Date();
    }
  }),
  load: function () {
    var me = this;
    return Promise.all(
      [consts.TRAILER, consts.TEAM].map(function (type) {
        me.get(type).then(function (item) {
          if (item !== null) {
            item.layer = me.layer;
            return item.loadGPX();
          }
        });
      }));
  },
  import: function () {
    var me = this;
    return Promise.all(
      [consts.TRAILER, consts.TEAM].map(function (type) {
        me.get(type).then(function (item) {
          if (item !== null) {
            item.layer = me.layer;
            return item.importGPX(null, {type: type});
          }
        });
      }));
  }
});

export default Trail;


