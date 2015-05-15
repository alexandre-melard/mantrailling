/**
 * Created by alex on 31/03/2015.
 */
import DS from 'ember-data';

export default DS.Model.extend({
  type: DS.attr(), // Trailer or Team
  gpx: DS.attr('string'), // GPX exchange format
  length: DS.attr('number', {defaultValue: 0}),
  location: DS.attr('string'),
  feature: null,   // OpenLayers object
  map: null,
  layer: null,

  extensions: function(gpx, key, value) {
    var gpxDoc = $.parseXML( gpx );
    var $gpx = $( gpxDoc );
    var $extensions = $gpx.find( "extensions" );
    if ($extensions.length === 0) {
      $gpx.find("rte").append("<extensions></extensions>");
      $extensions = $gpx.find( "extensions" );
    }
    if (value !== undefined) {
      $extensions.append("<" + key + ">" + value + "</" + key + ">");
      return $gpx;
    }
    return $extensions.find(key).text();
  },

  /**
   * transform the layer object to GPX
   */
  exportToGPX: function() {
    var me = this;
    return new Promise(function(resolve) {
      var format = new ol.format.GPX();
      var gpx = format.writeFeatures([me.feature], {featureProjection: "EPSG:3857"});
      var extensions = me.feature.get('extensions');
      if (extensions !== undefined) {
        for (var property in extensions) {
          if (extensions.hasOwnProperty(property)) {
            gpx = me.extensions(gpx, property, extensions[property]);
          }
        }
      }
      // we want the gpx as string format
      me.set('gpx', (new XMLSerializer()).serializeToString(gpx[0]));
      resolve(me.get('gpx'));
    });
  },

  /**
   * transform the GPX data to features layer
   */
  importGPX: function(gpx, extensions) {
    var me = this;
    return new Promise(function(resolve) {
      if (gpx !== undefined && gpx !== null) {
        if (extensions !== undefined) {
          for (var property in extensions) {
            if (extensions.hasOwnProperty(property)) {
              gpx = me.extensions(gpx, property, extensions[property]);
            }
          }
        }
        me.set('gpx', gpx);
      }
      var source = new ol.source.StaticVector({
        format: new ol.format.GPX(),
        projection: 'EPSG:3857'
      });
      // convert xml to openlayers
      me.feature = source.readFeatures(me.get('gpx'))[0];
      me.feature.set('extensions', extensions);
      // add the feature to the feature's layer
      me.layer.getSource().addFeature(me.feature);
      resolve(me.feature);
    });
  }
});
