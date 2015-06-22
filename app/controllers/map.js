import Ember from 'ember';
import getStyleFunction from "../utils/map-style";
import conf from "../config/environment";

/**
 * Created by alex on 29/03/2015.
 */
export default Ember.Controller.extend({
  needs: ["mapLayers"],
  mapLayers: Ember.computed.alias("controllers.mapLayers"),
  map: null,
  currentLayer: null,
  basicURL: conf.basicURL,
  expertURL: conf.expertURL,

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
      vectorSource = new ol.source.GPX({object: features});
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
      layer.setStyle(getStyleFunction(this.command, this.i18n));
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


  build: function () {
    var me = this;
    this.set('map', this.createMap());
    window.gMap = this.map;
    this.get('mapLayers').loadLayers().then(function (layers) {
      var map = me.get('map');
      var vectors = [];
      if (map.getLayers().get('length') !== 0) {
        // Save current vecotr used for drawing
        map.getLayers().getArray().forEach(function(vector) {
          vectors.push(vector);
          map.removeLayer(vector);
        });
      }
      // set Tile layers
      layers.forEach(function(layer) {
        map.addLayer(layer.layer);
      });
      // restore vectors
      vectors.forEach(function(vector) {
        map.addLayer(vector);
      });
      if (me.currentLayer !== null) {
        me.changeCurrentLayer(me.currentLayer);
      }
    });
  },

  actions: {
    screenshot: function() {
      var map = this.get('map');
      var interaction = new ol.interaction.DragBox({
        style: new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'red',
            width: 2
          })
        })
      });
      interaction.on('boxend', function(e) {
        var format = new ol.format.GeoJSON();
        var geom = e.target.getGeometry();
        var tl = gMap.getPixelFromCoordinate(geom.getCoordinates()[0][0]);
        var bl = gMap.getPixelFromCoordinate(geom.getCoordinates()[0][1]);
        var br = gMap.getPixelFromCoordinate(geom.getCoordinates()[0][2]);
        var tr = gMap.getPixelFromCoordinate(geom.getCoordinates()[0][3]);
        console.log("bbox: [" + tl + ", " + bl + ", " + br + ", " + tr + "]" );
        var ctx = $("canvas")[0].getContext("2d");
        var topLeftArray = tl.split(',');
        var bottomRightArray = br.split(',');
        var data = ctx.getImageData(topLeftArray[0],topLeftArray[1],bottomRightArray[0] - topLeftArray[0],bottomRightArray[1] - topLeftArray[1]);

        map.removeInteraction(interaction);
      });
      map.addInteraction(interaction);
    }
  }
});
