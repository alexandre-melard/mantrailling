import MapLayerService from "../services/map-layer-service.js";

export default {
  name: 'map-layer-service',
  initialize: function(container, application) {
    application.register('map-layer-service:main', MapLayerService, { instantiate: true });
    application.inject('component:map-app', 'mapLayerService', 'map-layer-service:main');
  }};
