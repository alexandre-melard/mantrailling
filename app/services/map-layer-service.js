import Ember from 'ember';

export default Ember.Service.extend({

  init: function () {
    this._super();
    this.set('mapLayerGetCapabilitiesService', this.container.lookup("service:map-layer-getcapabilities-service:main"));
    this.set('mapDataLayerService', this.container.lookup("service:map-data-layer-service:main"));
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

  getWMTSLayers: function () {
    var me = this;
    var layers = [];
    var getLayer = function (desc, wmtsLayer) {
      return new Promise(function (resolve, error) {
        me.mapDataLayerService.getLayer(desc.Identifier).then(function (layer) {
          layer.layer = wmtsLayer;
          if (layer.opacity === null) {
            layer.opacity = 1;
          }
          layer.save();
          resolve(layer);
        }).catch(function () {
          me.mapDataLayerService.addLayer(desc.Identifier, desc.Title, desc.Abstract, true, 1, wmtsLayer).then(function (layer) {
            resolve(layer);
          });
        });
      });
    };
    return Promise.all([this.mapLayerGetCapabilitiesService.getWMTSGetCapabilities()])
      .then(function (results) {
        var descriptions = results[0].layers,
          tms = results[0].tms;
        return Promise.all(descriptions.map(function (desc) {
          var wmtsLayer = me.createWMTSLayer(desc, tms);
          return getLayer(desc, wmtsLayer).then(function (dataLayer) {
            console.log("retrieving layer");
            return dataLayer.layer;
          });
        }))
      });
  },

  addLayer: function (identifier, title, abstract, visible, opacity, layer) {
    var record = this.store.createRecord('mtgLayer',
      {
        identifier: identifier,
        title: title,
        abstract: abstract,
        visible: visible,
        opacity: opacity,
        layer: layer
      });
    record.save();
    console.log('layer added');
    return record;
  },

  updateLayer: function (layer) {
    layer.save();
    console.log('layer updated');
  },

  deleteLayer: function (layer) {
    layer.destroyRecord();
    console.log('layer destroyed');
  },

  getLayers: function (callback) {
    this.store.find('mtgLayer').then(callback);
    console.log('getLayers');
  }
});
