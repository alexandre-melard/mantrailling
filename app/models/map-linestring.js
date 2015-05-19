/**
 * Created by alex on 31/03/2015.
 */
import DS from 'ember-data';
import xml2json from '../utils/xml2json.js';
import json2xml from '../utils/json2xml.js';

export default DS.Model.extend({
  map: null,
  layer: null,
  feature: null,   // OpenLayers object
  xml: DS.attr('string'), // XML exchange format

  removeFromMap: function() {
    if (this.layer !== null && this.feature !== null) {
      this.layer.getSource().removeFeature(this.feature);
    }
  },

  extensions: function(xml, value) {
    var $xml;
    if (typeof xml  === "string") {
      var gpxDoc = $.parseXML( xml );
      $xml = $( gpxDoc );
    } else {
      $xml = xml;
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

  export: function(formatType) {
    var me = this;
    return new Promise(function(resolve) {
      var format;
      if (formatType === "GPX") {
        format = new ol.format.GPX();
      } else if (formatType === "GML3") {
        format = new ol.format.GML3();
      }
      var xml = format.writeFeatures([me.feature], {featureProjection: "EPSG:3857"});
      var extensions = me.feature.get('extensions');
      if (extensions !== undefined) {
        xml = me.extensions(xml, extensions);
      }
      // we want the gpx as string format
      me.set('xml', (new XMLSerializer()).serializeToString(xml[0]));
      resolve(me.get('xml'));
    });
  },

  /**
   * transform the layer object to GPX
   */
  exportToGPX: function() {
    return this.export('GPX');
  },

  /**
   * transform the layer object to GML
   */
  exportToGML: function() {
    return this.export('GML');
  },

  load: function(formatType) {
    var me = this;
    return new Promise(function(resolve) {
      var format;
      if (formatType === "GPX") {
        format = new ol.format.GPX();
      } else if (formatType === "GML3") {
        format = new ol.format.GML3();
      }
      var source = new ol.source.StaticVector({
        format: format,
        projection: 'EPSG:3857'
      });

      // convert xml to openlayers
      me.feature = source.readFeatures(me.get('xml'))[0];
      me.feature.set('extensions', xml2json(me.extensions(me.get('xml'))));

      // add the feature to the feature's layer
      me.layer.getSource().addFeature(me.feature);
      resolve(me.feature);
    });
  },

  /**
   * transform the GPX data to features layer
   */
  loadGPX: function() {
    return this.load('GPX');
  },

  /**
   * transform the GML data to features layer
   */
  loadGML: function() {
    return this.load('GML');
  },

  import: function(formatType, xml, extensions) {
    var me = this;
    return new Promise(function(resolve) {
      var format;
      if (formatType === "GPX") {
        format = new ol.format.GPX();
      } else if (formatType === "GML3") {
        format = new ol.format.GML3();
      }
      if (xml !== undefined && xml !== null) {
        if (extensions !== undefined) {
          for (var property in extensions) {
            if (extensions.hasOwnProperty(property)) {
              xml = me.extensions(xml, property, extensions[property]);
            }
          }
        }
        me.set("xml", new XMLSerializer().serializeToString(xml[0]));
      }
      var source = new ol.source.StaticVector({
        format: format,
        projection: 'EPSG:3857'
      });
      // convert xml to openlayers
      me.feature = source.readFeatures(me.get('xml'))[0];
      me.feature.set('extensions', extensions);

      // add the feature to the feature's layer
      me.layer.getSource().addFeature(me.feature);
      resolve(me.feature);
    });
  },

  /**
   * transform the GPX data to features layer
   */
  importGPX: function(xml, extensions) {
    return this.import("GPX", xml, extensions);
  },

  /**
   * transform the GPX data to features layer
   */
  importGML: function(xml, extensions) {
    return this.import("GML", xml, extensions);
  }

});
