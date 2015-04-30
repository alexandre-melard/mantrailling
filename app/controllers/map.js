import Ember from 'ember';
import formatLength from "../utils/map-format-length.js";
import formatArea from "../utils/map-format-area.js";
import calcBrightness from "../utils/color-get-brightness.js";
import getRGBColor from "../utils/color-get-rgb.js";

// Geometrie
var POINT = "Point";
var LINE_STRING = "LineString";
var POLYGON = "Polygon";
var TRAILER = "Trailer";
var MARKER = "Marker";

/**
 * Created by alex on 29/03/2015.
 */
export default Ember.Controller.extend({
  map: null,
  tileLayers: [],
  selectedTileLayer: null,
  currentLayer: null,

  createMap: function () {
    return new ol.Map({
      target: 'map',
      view: new ol.View({
        center: ol.proj.transform([5.1475, 45.6329], 'EPSG:4326', 'EPSG:3857'),
        zoom: 15
      })
    });
  },

  getDefaultStyle: function () {
    var me = this;
    var getColor = function (def, feature) {
      var color = feature.get("color");
      if (color === undefined || color === null) {
        color = def;
      }
      return color;
    };
    var markerStyle = function (geometry, feature) {
      return [new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
          anchor: [0.5, 32],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          opacity: 1,
          src: "assets/images/Marker-Outside-Pink.png"
        }))
      })
      ];
    };

    var pointStyle = function (geometry, feature) {
      var type = feature.get('specificType');
      if (type === MARKER) {
        return markerStyle(geometry, feature);
      } else {
        var radius = feature.get('radius') || 10;
        var label = feature.get('label') || "";
        var rgb = getRGBColor(getColor('#ac2925', feature));
        return [new ol.style.Style({
          image: new ol.style.Circle({
            radius: radius,
            fill: new ol.style.Fill({
              color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.5)'
            }),
            stroke: new ol.style.Stroke({
              color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.8)',
              width: 2
            })
          }),
          text: new ol.style.Text({
            //offsetX: -radius,
            font: '18px Calibri,sans-serif',
            text: label,
            fill: new ol.style.Fill({
              color: getColor('#286090', feature)
            }),
            stroke: new ol.style.Stroke({
              color: (calcBrightness(rgb) < 220) ? "#FFFFFF" : "#000000",
              width: 3
            })
          })
        })
        ];
      }
    };

    var polygonStyle = function (geometry, feature) {
      var label = formatArea(me.map, feature.getGeometry());
      var color = getColor('#204d74', feature);
      var rgb = getRGBColor(color);
      return [new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.2)'
        }),
        stroke: new ol.style.Stroke({
          color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.8)'
        }),
        text: new ol.style.Text({
          offsetY: -10,
          font: '18px Calibri,sans-serif',
          text: label,
          fill: new ol.style.Fill({
            color: getColor('#286090', feature)
          }),
          stroke: new ol.style.Stroke({
            color: (calcBrightness(rgb) < 220) ? "#FFFFFF" : "#000000",
            width: 3
          })
        })
      })];
    };

    var lineStringStyle = function (geometry, feature) {
      var label = formatLength(me.map, feature.getGeometry());
      var type = feature.get('specificType');
      var styles = [];
      var color, rgb;
      if (type === 'Team') {
        color = getColor('#ec971f', feature);
        rgb = getRGBColor(color);
        styles.push(new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.8)',
            width: 2
          }),
          text: new ol.style.Text({
            offsetY: -10,
            font: '18px Calibri,sans-serif',
            text: label,
            fill: new ol.style.Fill({
              color: getColor('#ec971f', feature)
            }),
            stroke: new ol.style.Stroke({
              color: (calcBrightness(rgb) < 220) ? "#FFFFFF" : "#000000",
              width: 3
            })
          })
        }));
      } else {
        color = getColor('#449d44', feature);
        rgb = getRGBColor(color);
        styles.push(new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.8)',
            width: 4
          }),
          text: new ol.style.Text({
            offsetY: 10,
            font: '18px Calibri,sans-serif',
            text: label,
            fill: new ol.style.Fill({
              color: getColor('#449d44', feature)
            }),
            stroke: new ol.style.Stroke({
              color: (calcBrightness(rgb) < 220) ? "#FFFFFF" : "#000000",
              width: 3
            })
          })
        }));
      }
      if (type === TRAILER) {
        geometry.forEachSegment(function (start, end) {
          var startLine = geometry.getFirstCoordinate();
          var endLine = geometry.getLastCoordinate();
          var rgb;
          if (start[0] === startLine[0] && start[1] === startLine[1]) {
            rgb = getRGBColor('#008000');
            styles.push(new ol.style.Style({
              geometry: new ol.geom.Point(start),
              image: new ol.style.Circle({
                radius: 10,
                fill: new ol.style.Fill({
                  color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.2)'
                }),
                stroke: new ol.style.Stroke({
                  color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.8)'
                })
              })
            }));
          }
          if (end[0] === endLine[0] && end[1] === endLine[1]) {
            rgb = getRGBColor('#FF0000');
            styles.push(new ol.style.Style({
              geometry: new ol.geom.Point(end),
              image: new ol.style.Circle({
                radius: 10,
                fill: new ol.style.Fill({
                  color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.2)'
                }),
                stroke: new ol.style.Stroke({
                  color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.8)'
                })
              })
            }));
          }
        });
      }
      return styles;
    };
    return function (feature) {
      if (!(feature instanceof ol.Feature)) {
        feature = this;
      }
      var style = null;
      var geometry = feature.getGeometry();
      if (geometry.getType() === POINT) {
        style = pointStyle(geometry, feature);
      } else if (geometry.getType() === POLYGON) {
        style = polygonStyle(geometry, feature);
      } else if (geometry.getType() === LINE_STRING) {
        style = lineStringStyle(geometry, feature);
      } else if (geometry.getType() === MARKER) {
        style = markerStyle(geometry, feature);
      }
      return style;
    };
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
      layer.setStyle(this.getDefaultStyle());
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
  },

  toggleVisibility: function (key, value) {
    var layer = this.get('model');
    if (value === undefined) {
      return layer.getVisible();
    } else {
      layer.setVisible(value);
    }
    return value;
  }.property('toggleVisibility')
});
