import Ember from 'ember';

export default Ember.Component.extend({
  map: null,

  loadMap: function() {
    var me = this;

    // Fix Ember to resize the map fullscreen
    $.each([$('#map'), $('#map').parents()], function (index, parent) {
      $(parent).height("100%");
    });

    // Get layers and draw map
    this.mapLayerService.getWMTSLayers().then(function(layers) {
      var center = me.get('center').split(',');
      center[0] = parseFloat(center[0]);
      center[1] = parseFloat(center[1]);
      me.set('map', me.mapService.createMap(me.get('id'), center, me.get('zoom'), layers));
    });
  }.on('didInsertElement')

});
