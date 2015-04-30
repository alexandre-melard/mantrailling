import MapService from "../services/map-service.js";

export default {
  name: 'map-service',
  initialize: function(container, application) {
    application.register('map-service:main', MapService, { instantiate: true });
    application.inject('component:map-app', 'mapService', 'map-service:main');
    application.inject('component:map-data', 'mapService', 'map-service:main');
  }
};
