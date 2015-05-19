import DS from 'ember-data';
import * as consts from '../utils/map-constants.js';

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
  load: function () {
    var me = this;
    return Promise.all(
      ['lineStrings', 'points', 'polygons'].map(function (type) {
        this.get(type).then(function (items) {
          if (items !== null) {
            items.forEach(function (item) {
              return item.loadGeoJSON();
            });
          }
        });
      }));
  },
  import: function () {
    var me = this;
    return Promise.all(
      ['lineStrings', 'points', 'polygons'].map(function (type) {
        this.get(type).then(function (items) {
          if (items !== null) {
            items.forEach(function (item) {
              return importGeoJSON(null, {type: type});
            });
          }
        });
      }));
  }
});

export default MapDraw;


