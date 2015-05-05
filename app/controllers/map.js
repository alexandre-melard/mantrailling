import Ember from 'ember';
import constants from '../utils/map-constants.js';
import getStyleFunction from "../utils/map-style.js";

/**
 * Created by alex on 29/03/2015.
 */
export default Ember.Controller.extend({
  map: null,
  tileLayers: [],
  selectedTileLayer: null,
  currentLayer: null,

  bindCommand: function () {
    this.command.register(this, 'map.view.extent.fit', function(options) {
      var map = this.get('map');
      var layer = this.get('currentLayer');
      return new Promise(function (resolve, error) {
        map.getView().fitExtent( layer.getSource().getExtent(), (map.getSize()));
        resolve(true);
      });
    });
  }.on('init'),


  createMap: function () {
    return new ol.Map({
      target: 'map',
      view: new ol.View({
        center: ol.proj.transform([5.1475, 45.6329], 'EPSG:4326', 'EPSG:3857'),
        zoom: 15
      })
    });
  },

  createVectorSource: function (features) {
    var vectorSource = null;
    if (features !== undefined && features !== null) {
      vectorSource = new ol.source.GeoJSON({object: features});
    } else {
      vectorSource = new ol.source.Vector();
    }
    return vectorSource;
  },

  createVector: function (source) {
    return new ol.layer.Vector({
      source: source
    });
  },

  changeCurrentLayer: function (layer) {
    if (layer === undefined || layer === null) {
      var source = this.createVectorSource();
      layer = this.createVector(source);
      layer.setStyle(getStyleFunction(this.get('map')));
    } else if (this.map !== null) {
      this.map.removeLayer(this.currentLayer);
    }
    if (this.map !== null) {
      if (this.currentLayer !== null) {
        this.map.removeLayer(this.currentLayer);
      }
      this.map.addLayer(layer);
    }
    this.set('currentLayer', layer);
    return layer;
  },

  createWMTSLayer: function (layer, tms) {
    var attribution = "&copy; <a href='http://www.ign.fr'>IGN</a>";
    var projection = ol.proj.get(tms.SupportedCRS);
    var resolutions = new Array(tms.TileMatrix.length);
    var matrixIds = new Array(tms.TileMatrix.length);
    tms.TileMatrix.forEach(function (tm) {
      var index = tm.Identifier;
      matrixIds[index] = index;
      resolutions[index] = parseFloat(tm.ScaleDenominator) * 0.00028;
    });

    var tile = new ol.layer.Tile({
      source: new ol.source.WMTS({
        attribution: attribution,
        url: 'http://wxs.ign.fr/6i88pkdxubzayoady4upbkjg/geoportail/wmts',
        layer: layer.Identifier,
        matrixSet: layer.TileMatrixSetLink[0].TileMatrixSet,
        format: layer.Format[0],
        projection: projection,
        tileGrid: new ol.tilegrid.WMTS({
          origin: tms.TileMatrix[0].TopLeftCorner,
          resolutions: resolutions,
          matrixIds: matrixIds
        }),
        style: 'normal',
        wrapX: true
      })
    });
    return tile;
  },

  loadWMTSGetCapabilities: function () {
    var parser = new ol.format.WMTSCapabilities();
    var createWMTSLayer = this.createWMTSLayer;
    var olMap = this.map;
    var tileLayers = this.tileLayers;
    var store = this.store;
    return $.ajax('assets/data/GetCapabilities.xml')
      .done(function (response) {
        var result = parser.read(response);
        result.Contents.Layer.reverse().forEach(function (desc) {
          var tile = createWMTSLayer(desc, result.Contents.TileMatrixSet[0]);
          var layerPromise = store.find('mapLayer', {identifier: desc.Identifier});
          layerPromise
            .then(function (layers) {
              var layer = layers.get('firstObject');
              layer.layer = tile;
              if (layer.opacity === null) {
                layer.opacity = 1;
              }
              return layer;
            })
            .catch(function () {
              var layer = store.createRecord('mapLayer', {
                identifier: desc.Identifier,
                title: desc.Title,
                abstract: desc.Abstract,
                visible: true,
                opacity: 1,
                layer: tile
              });
              return layer;
            })
            .then(function (tileLayer) {
              tileLayer.save();
              tileLayers.unshiftObject(tileLayer);

              // We insert the layer before the vector layer if any
              var len = olMap.getLayers().getArray().length;
              len = (len > 1) ? len : 1;
              olMap.getLayers().insertAt(len - 1, tileLayer.layer);
              console.log("tileLayer.layer.setVisible(tileLayer.visible) : " + tileLayer.get('visible'));
              tileLayer.layer.setVisible(tileLayer.get('visible'));
              console.log("tileLayer.layer.setOpacity(tileLayer.opacity) : " + tileLayer.get('opacity'));
              tileLayer.layer.setOpacity(tileLayer.get('opacity'));
              return tileLayer;
            });
        });
      })
      .fail(function (e) {
        console.log("could not load getcapabilities" + e);
      });
  },

  loadWMTSLayers: function () {
    return this.loadWMTSGetCapabilities();
  },

  build: function () {
    var me = this;
    this.set('map', this.createMap());
    window.gMap = this.map;
    this.loadWMTSLayers().then(function () {
      if (me.currentLayer !== null) {
        me.changeCurrentLayer(me.currentLayer);
      }
    });
  }
});
