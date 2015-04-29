import Ember from 'ember';

export default Ember.Service.extend({
  store: null,

  init: function() {
    this._super();
    this.set('store', this.container.lookup("store:main"));
  },

  addLayer: function(identifier, title, abstract, visible, opacity, layer) {
    var record = this.store.createRecord('mapLayer',
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

  updateLayer: function(layer) {
    layer.save();
    console.log('layer updated');
  },

  deleteLayer: function(layer) {
    layer.destroyRecord();
    console.log('layer destroyed');
  },

  getLayer: function(identifier) {
    return this.store.find('mapLayer', {identifier: identifier});
  },

  getLayers: function(callback) {
    this.store.find('mapLayer');
    console.log('getLayers');
  }
});
