/**
 * Created by alex on 04/04/2015.
 */
import Ember from 'ember';
import * as consts from '../utils/map-constants';
import formatLength from "../utils/map-format-length";
import file from "../utils/file-io";

export default Ember.Controller.extend({
  needs: ["mtgTrail"],
  mtgTrail: Ember.computed.alias("controllers.mtgTrail"),
  map: Ember.computed.alias("controllers.mtgTrail.map"),
  formats: [consts.GPX],
  isInfoLength: false,
  isInfoLocation: false,

  onCreatePathStart: function (type, options) {
    var me = this;
    var selectedTrail = me.get('mtgTrail').get('selectedTrail');
    return new Promise(function (resolve) {
      var ls = me.store.createRecord('mapLinestring', {
        type: consts.TRAILER,
        feature: options.feature,
        map: options.map,
        layer: options.layer
      });
      var last = selectedTrail.get(type);
      if (!Ember.isEmpty(last)) {
        last.removeFromMap(selectedTrail.layer);
        last.deleteRecord();
      }
      selectedTrail.set(type, ls);
      resolve(ls);
    });
  },

  onCreatePathEnd: function (type) {
    var me = this;
    return new Promise(function (resolve) {
      var ls = me.get('mtgTrail').get('selectedTrail').get(type);
      ls.exportToGPX();
      resolve(ls);
    });
  },

  bindCommand: function () {
    var me = this;
    this.command.register(this, 'map.draw.linestring.created', function (options) {
      var feature = options.feature;
      var trail = me.get('mtgTrail').get('selectedTrail');
      return new Promise(function (resolve) {
        me.get('mtgTrail').getOrCreateMapDraw().then(function (mapDraw) {
          var ls = me.store.createRecord('mapLinestring');
          ls.layer = trail.layer;
          ls.feature = feature;
          ls.exportGeoJSON();
          mapDraw.get('lineStrings').pushObject(ls);
          resolve(ls);
        });
      });
    });
    this.command.register(this, 'map.linestring.remove', function (options) {
      var me = this;
      return new Promise(function () {
        if (options.feature.get('extensions').type === consts.TRAILER) {
          me.command.send('map.info.length', {
            length: 0
          });
          me.command.send('map.info.location', {
            location: ""
          });
        }

      });
    });
    this.command.register(this, 'map.linestring.change', function (options) {
      var me = this;
      return new Promise(function () {
        var geometry = options.feature.getGeometry();
        var length = formatLength(me.get('map').getView().getProjection(), geometry);
        if (options.feature.get('label') !== length || !me.get('isInfoLength')) {
          options.feature.set('label', length);
          if (options.feature.get('extensions').type === consts.TRAILER) {
            me.command.send('map.info.length', {
              length: length
            });
            me.command.send('map.info.location', {
              location: ol.coordinate.toStringHDMS(
                ol.proj.transform(geometry.getFirstCoordinate(), 'EPSG:3857', 'EPSG:4326')
              )
            });
          }
        }
      });
    });
    this.command.register(this, 'map.info.length', function (options) {
      var me = this;
      return new Promise(function (resolve) {
        me.set('isInfoLength', true);
        me.get('mtgTrail').get('selectedTrail').set('length', options.length);
        resolve(true);
      });
    });
    this.command.register(this, 'map.info.location', function (options) {
      var me = this;
      return new Promise(function (resolve) {
        me.set('isInfoLocation', true);
        me.get('mtgTrail').get('selectedTrail').set('location', options.location);
        resolve(true);
      });
    });
  }.on('init'),

  exportTrace: function (format, trace) {
    var data = trace.serialize(format);
    file.write(data, "trace", format);
  },

  mapImportTrailer: function () {
    this.importTrace(consts.TRAILER, this.get('mtgTrail').get('selectedTrail'));
  },

  mapImportTeam: function () {
    this.importTrace(consts.TEAM, this.get('mtgTrail').get('selectedTrail'));
  },

  importTrace: function (type, trail) {
    var me = this;
    file.read('gpx', function(gpx) {
      var mapLineString = trail.get(type);
      if (Ember.isEmpty(mapLineString)) {
        mapLineString = me.store.createRecord('mapLinestring');
        trail.set(type, mapLineString);
      }
      mapLineString.removeFromMap(me.get('mtgTrail').get('controllers.map').get('currentLayer'));

      // set linestring type, used in map info for example
      mapLineString.importGPX(gpx, consts.style[type]).then(function (feature) {
        feature.get('extensions').type = type;

        // add the feature to the feature's layer
        trail.get('layer').getSource().addFeature(feature);

        // Mise à jour de la longueur de piste
        me.command.send("map.linestring.change", {feature: feature});

        var options = {
          layer: trail.get('layer')
        };
        me.command.send('map.view.extent.fit', options);
      });
    });
  },

  addTrace: function(type) {
    var me = this;
    return new Promise(function(resolve) {
      consts.style[type].type = type;
      me.command.send("map.draw.linestring", consts.style[type], function (feature) {
        me.onCreatePathStart(type, {
          feature: feature,
          map: me.get('mtgTrail').get('map'),
          layer: me.get('mtgTrail').get('controllers.map').get('currentLayer')
        }).then(function () {
          me.onCreatePathEnd(type).then(function() {
            resolve(true);
          });
        });
      });
    });
  },

  actions: {
    trailerTraceCreateAction: function() {
      $(".mtg-trail-create-trailer").addClass('hidden');
      $(".map-draw-follow-path").removeClass('hidden');
      this.addTrace(consts.TRAILER).then(function() {
        $(".map-draw-follow-path").addClass('hidden');
        $(".mtg-trail-create-trailer").removeClass('hidden');
      });
    },
    teamTraceCreateAction: function() {
      $(".mtg-trail-create-team").addClass('hidden');
      $(".map-draw-follow-path").removeClass('hidden');
      this.addTrace(consts.TEAM).then(function() {
        $(".map-draw-follow-path").addClass('hidden');
        $(".mtg-trail-create-team").removeClass('hidden');
      });
    },
    trailerTraceImportAction: function() {
      this.mapImportTrailer();
    },
    teamTraceImportAction: function() {
      this.mapImportTeam();
    },
    trailerTraceExportAction: function() {
      this.exportTrace(format, this.get('mtgTrail').get('selectedTrail'));
    }
  }
});
