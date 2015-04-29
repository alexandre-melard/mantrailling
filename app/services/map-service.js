import Ember from 'ember';

export default Ember.Service.extend({
  map: null,

  createMap: function (target, center, zoom, layers) {
    return new ol.Map({
      target: target,
      layers: layers,
      view: new ol.View({
        center: ol.proj.transform(center, 'EPSG:4326', 'EPSG:3857'),
        zoom: zoom
      })
    });
  }
});
