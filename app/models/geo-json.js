/**
 * Created by alex on 31/03/2015.
 */
import DS from 'ember-data';

export default DS.Model.extend({
  feature: null,   // OpenLayers object
  geoJSON: DS.attr('string'), // XML exchange format

  bindCommand: function () {
    var me = this;
    this.command.register(this, 'save', function (options) {
      return new Promise(function (resolve) {
        console.log("saving feature with id: " + me.feature.getId());
        me.save();
        resolve(true);
      });
    });
    this.command.register(this, 'map.feature.save', function (options) {
      return new Promise(function (resolve) {
        if (options.feature.getId() === me.feature.getId()) {
          console.log("saving feature with id: " + me.feature.getId());
          me.save();
          resolve(true);
        }
      });
    });
    this.command.register(this, 'map.feature.remove', function (options) {
      return new Promise(function (resolve) {
        if (options.feature.getId() === me.feature.getId()) {
          console.log("removing feature with id: " + me.feature.getId());
          me.deleteRecord();
          resolve(true);
        }
      });
    });
  }.on('init'),

  removeFromMap: function(layer) {
    if (layer !== null && this.feature !== null) {
      layer.getSource().removeFeature(this.feature);
    }
  },

  /**
   * transform the layer object to GeoJSON
   */
  exportGeoJSON: function() {
    var me = this;
    var feature = me.feature;
    feature.setId(this.id);
    return new Promise(function(resolve) {
      var format = new ol.format.GeoJSON();
      var geoJSON = format.writeFeatures([feature], {featureProjection: "EPSG:3857"});

      // we want the geoJSON as string format
      me.set('geoJSON', geoJSON);

      resolve(geoJSON);
    });
  },

  /**
   * transform the GeoJSON data to features layer
   */
  loadGeoJSON: function(layer) {
    var me = this;
    return new Promise(function(resolve) {
      var source = new ol.source.StaticVector({
        format: new ol.format.GeoJSON(),
        projection: 'EPSG:3857'
      });

      // convert geoJSON to openlayers
      var feature = source.readFeatures(me.get('geoJSON'))[0];
      feature.setId(me.id);

      me.feature = feature;

      // add the feature to the feature's layer
      layer.getSource().addFeature(feature);
      resolve(feature);
    });
  },

  /**
   * transform the GeoJSON data to features layer
   */
  importGeoJSON: function(feature, geoJSON, extensions) {
    var me = this;
    return new Promise(function(resolve) {
      if (typeof geoJSON === 'string') {
        geoJSON = JSON.parse(geoJSON);
      }
      if (geoJSON !== undefined && geoJSON !== null) {
        if (extensions !== undefined) {
          if (geoJSON.properties === undefined) {
            geoJSON.properties = {};
          }
          geoJSON.properties.extensions = extensions;
        }
        me.set("geoJSON", JSON.stringify(geoJSON));
      }
      resolve(me.loadGeoJSON());
    });
  }});
