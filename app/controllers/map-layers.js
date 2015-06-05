import Ember from 'ember';

/**
 * Created by alex on 29/03/2015.
 */
export default Ember.Controller.extend({
  tileLayers: [],

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
    var me = this;
    return new Promise(function (resolve, fail) {
      var parser = new ol.format.WMTSCapabilities();
      var createWMTSLayer = me.createWMTSLayer;
      var store = me.store;
      $.ajax('assets/data/GetCapabilities.xml').done(function (response) {
        var result = parser.read(response);
        Promise.all(result.Contents.Layer.reverse().map(function (desc) {
          var tile = createWMTSLayer(desc, result.Contents.TileMatrixSet[0]);
          return store.find('mapLayer', {identifier: desc.Identifier}).then(function (layers) {
            var layer = layers.get('firstObject');
            layer.layer = tile;
            return layer;
          }).catch(function () {
            var layer = store.createRecord('mapLayer', {
              identifier: desc.Identifier,
              title: desc.Title,
              abstract: desc.Abstract,
              visible: true,
              opacity: 1,
              layer: tile
            });
            return layer;
          });
        })).then(function (tl) {
          tl.forEach(function (tileLayer) {
            tileLayer.save();
            console.log("tileLayer.layer.setVisible(tileLayer.visible) : " + tileLayer.get('visible'));
            tileLayer.layer.setVisible(tileLayer.get('visible'));
            console.log("tileLayer.layer.setOpacity(tileLayer.opacity) : " + tileLayer.get('opacity'));
            tileLayer.layer.setOpacity(tileLayer.get('opacity'));
          });
          me.set('tileLayers', tl.copy().reverse());
          resolve(tl);
        });
      }).fail(function (e) {
        console.log("could not load getcapabilities" + e);
        fail("could not load getcapabilities" + e);
      });
    });
  },

  loadLayers: function () {
    return this.loadWMTSGetCapabilities();
  }

});
