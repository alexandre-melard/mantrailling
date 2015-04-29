import MtgTrailService from "../services/mtg-trail-service.js";

export default {
  name: 'initializer-mtg-trail',
  initialize: function(container, application) {
    application.register('mtg-trail-service:main', MtgTrailService, { instantiate: true });
    application.inject('component:mtg-data', 'trailService', 'mtg-trail-service:main');
    application.inject('component:mtg-data-trail', 'trailService', 'mtg-trail-service:main');
    application.inject('component:mtg-data-trails', 'trailService', 'mtg-trail-service:main');
  }};
