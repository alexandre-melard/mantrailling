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
        console.log("saving feature with id: " + me.id);
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

  removeFromMap: function (layer) {
    if (layer !== null && this.feature !== null) {
      layer.getSource().removeFeature(this.feature);
      this.set('feature', null);
      this.set('geoJSON', null);
    }
  },

  /**
   * transform the layer object to GeoJSON
   */
  exportGeoJSON: function () {
    var me = this;
    var feature = me.feature;
    feature.setId(this.id);
    return new Promise(function (resolve) {
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
  loadGeoJSON: function (layer) {
    var me = this;
    return new Promise(function (resolve) {

      var format = new ol.format.GeoJSON();
      me.feature = format.readFeatures(me.get('geoJSON'), {featureProjection: 'EPSG:3857'})[0];
      me.feature.setId(me.id);
      me.feature = feature;

      // add the feature to the feature's layer
      layer.getSource().addFeature(feature);
      resolve(feature);
    });
  },

  /**
   * transform the GeoJSON data to features layer
   */
  importGeoJSON: function (layer, geoJSON, extensions) {
    var me = this;
    return new Promise(function (resolve) {
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
      resolve(me.loadGeoJSON(layer));
    });
  },

  serialize: function () {
    return {id: this.id, geoJSON: this.get('geoJSON')};
  },

  unserialize: function (json) {
    this.set('geoJSON', json.geoJSON);
  },

  label: Ember.computed('feature', {
    get(key) {
      if (this.get('feature') !== null) {
        return this.get('feature').get('label');
      }
    },
    set(key, value) {
      if (this.get('feature') !== null) {
        this.get('feature').set('label', value);
      }
    }
  })
});
