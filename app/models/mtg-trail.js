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
  points: DS.hasMany('mapPoint', {async: true}),
  zones: DS.hasMany('mapZone', {async: true}),
  createdAt: DS.attr('string', {
    defaultValue: function () {
      return new Date();
    }
  }),
  load: function() {
    var me = this;
    return Promise.all([
      this.get('Trailer').then(function (trailer) {
        if (trailer !== null) {
          trailer.layer = me.layer;
          return trailer.loadGPX();
        }
      }),
      this.get('Team').then(function (team) {
        if (team !== null) {
          team.layer = me.layer;
          return team.loadGPX();
        }
      })
      //if (this.get('points').get('length') !== 0) {
      //  this.get('points').forEach(function (point) {
      //    return point.import();
      //  });
      //}
      //if (this.get('zones').get('length') !== 0) {
      //  this.get('zones').forEach(function (zone) {
      //    return zone.import();
      //  });
      //}
    ]);
  },
  import: function () {
    var me = this;
    return Promise.all([
      this.get('Trailer').then(function (trailer) {
        if (trailer !== null) {
          trailer.layer = me.layer;
          return trailer.importGPX(null, {type: consts.TRAILER});
        }
      }),
      this.get('Team').then(function (team) {
        if (team !== null) {
          team.layer = me.layer;
          return team.importGPX(null, {type: consts.TEAM});
        }
      })
      //if (this.get('points').get('length') !== 0) {
      //  this.get('points').forEach(function (point) {
      //    return point.import();
      //  });
      //}
      //if (this.get('zones').get('length') !== 0) {
      //  this.get('zones').forEach(function (zone) {
      //    return zone.import();
      //  });
      //}
    ]);
  }
});

export default Trail;


