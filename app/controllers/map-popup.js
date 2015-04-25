/**
 * Created by alex on 13/04/2015.
 */
import Ember from 'ember';

export default Ember.Controller.extend({
  needs: ['map'],
  feature: null,
  content: null,
  overlay: null,

  initContent: function() {
    this.set('content', this.feature.get("content") || this.feature.values_.geometry.flatCoordinates.toString());
  }.observes('feature'),

  /**
   * Create an overlay to anchor the popup to the map.
   */
  createOverlay: function(element) {
    return new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
      element: element,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    }));
  },

  hide: function() {
    this.overlay.setPosition(undefined);
  },

  addToMap: function(element) {
    var map = this.get('controllers.map.map');
    this.overlay = this.createOverlay(element);
    map.addOverlay(this.overlay);
  },

  setPosition: function(position) {
    this.overlay.setPosition(position);
  }
});
