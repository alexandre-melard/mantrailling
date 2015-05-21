/**
 * Created by alex on 31/03/2015.
 */
import DS from 'ember-data';
import GeoJSON from '../models/geo-json.js';
import xml2json from '../utils/xml2json.js';
import json2xml from '../utils/json2xml.js';

export default GeoJSON.extend({
  gpx: DS.attr('string'), // XML GPS exchange format

  extensions: function(gpx, value) {
    var $xml;
    if (typeof gpx  === "string") {
      var gpxDoc = $.parseXML( gpx );
      $xml = $( gpxDoc );
    } else {
      $xml = gpx;
    }
    var $extensions = $xml.find( "extensions" );
    if ($extensions.length === 0) {
      // OpenLayers generate RTE whereas some other tools generate trk to describe a path
      var where = "rte";
      if($xml.find("trk").length > 0) {
        where = "trk";
      } else if($xml.find("gml").length > 0) {
        where = "gml";
      }
      $xml.find(where).append("<extensions></extensions>");
      $extensions = $xml.find( "extensions" );
    }
    if (value !== undefined) {
      $extensions.append(json2xml(value));
      return $xml;
    }
    return $extensions[0];
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
        gpx = me.extensions(gpx, extensions);
      }
      // we want the gpx as string format
      me.set('gpx', (new XMLSerializer()).serializeToString(gpx[0]));
      resolve(me.get('gpx'));
    });
  },

  /**
   * transform the GPX data to features layer
   */
  loadGPX: function(layer) {
    var me = this;
    return new Promise(function(resolve) {
      var source = new ol.source.StaticVector({
        format: new ol.format.GPX(),
        projection: 'EPSG:3857'
      });

      // convert gpx to openlayers
      me.feature = source.readFeatures(me.get('gpx'))[0];
      me.feature.set('extensions', xml2json(me.extensions(me.get('gpx'))));

      // add the feature to the feature's layer
      layer.getSource().addFeature(me.feature);
      resolve(me.feature);
    });
  },

  /**
   * transform the GPX data to features layer
   */
  importGPX: function(layer, gpx, extensions) {
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
        me.set("gpx", new XMLSerializer().serializeToString(gpx[0]));
      }
      var source = new ol.source.StaticVector({
        format: new ol.format.GPX(),
        projection: 'EPSG:3857'
      });
      // convert gpx to openlayers
      me.feature = source.readFeatures(me.get('gpx'))[0];
      me.feature.set('extensions', extensions);

      // add the feature to the feature's layer
      layer.getSource().addFeature(me.feature);
      resolve(me.feature);
    });
  }
});
