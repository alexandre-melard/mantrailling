import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['map-popup'],
  layoutName: 'components/map-popup',
  feature: null,
  overlay: null,
  map: null,
  editable: true,

  content: function (value) {
    if (value && value !== "content") {
      this.get('feature').set('description', value);
    }
    console.log("popup content:" + this.content);
    return this.get('feature').get('description')||"Click to enter a description";
  }.property('feature.description'),

  /**
   * Create an overlay to anchor the popup to the map.
   */
  createOverlay: function (element) {
    return new ol.Overlay( ({
      element: element,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      },
      stopEvent: true
    }));
  },

  hide: function () {
    delete this.overlay;
    this.remove();
  },

  addToMap: function (element) {
    this.overlay = this.createOverlay(element);
    this.map.addOverlay(this.overlay);
  },

  setPosition: function (position) {
    this.overlay.setPosition(position);
  },

  setEditable: function() {
    var me = this;
    this.$('.editable').editable({
      mode: 'inline',
      success: function (response, newValue) {
        me.get('feature').set('description', newValue);
      }
    });
  },

  setUp: function () {
    this.addToMap(this.element);
    this.setPosition(this.feature.getGeometry().getCoordinates());
    this.$('.popup-closer').on('click', {ctx: this}, function () {
      //event.data.ctx.hide();
      $(this.closest('.map-popup')).css('display', 'none');
    });
  }.on('didInsertElement'),

  // Not working
  actions: {
    closePopup: function () {
      this.hide();
    }
  }
});
