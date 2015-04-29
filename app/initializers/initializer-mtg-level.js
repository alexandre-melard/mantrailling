import MtgLevelService from "../services/mtg-level-service.js";

export default {
  name: 'initializer-mtg-level',
  initialize: function(container, application) {
    application.register('mtg-level-service:main', MtgLevelService, { instantiate: true });
    application.inject('component:mtg-data', 'levelService', 'mtg-level-service:main');
    application.inject('component:mtg-data-level', 'levelService', 'mtg-level-service:main');
    application.inject('component:mtg-data-levels', 'levelService', 'mtg-level-service:main');
  }};
