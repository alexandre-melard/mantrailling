import Ember from 'ember';

export default Ember.Service.extend({
  map: null,

  center: function() {
    if (this.get('map') !== null) {
      return ol.proj.transform(this.get('map').getView().getCenter(), 'EPSG:3857', 'EPSG:4326');
    }
  }.property('map'),


  createMap: function (target, center, zoom, layers) {
    this.set('map', new ol.Map({
      target: target,
      layers: layers,
      view: new ol.View({
        center: ol.proj.transform(center, 'EPSG:4326', 'EPSG:3857'),
        zoom: zoom
      })
    }));
    return this.get('map');
  },
});
