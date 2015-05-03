import MapDrawService from "../services/map-draw-service.js";

export default {
  name: 'map-draw-service-initializer',
  initialize: function(container, application) {
    application.register('map-draw-service-initializer:main', MapDrawService, { instantiate: true });
    application.inject('controller:map-draw', 'mapDrawService', 'map-draw-service-initializer:main');
    application.inject('controller:mtg-item', 'mapDrawService', 'map-draw-service-initializer:main');
    application.inject('controller:map-location', 'mapDrawService', 'map-draw-service-initializer:main');
  }
};

