import MtgItemService from "../services/mtg-item-service.js";

export default {
  name: 'initializer-mtg-item',
  initialize: function(container, application) {
    application.register('mtg-item-service:main', MtgItemService, { instantiate: true });
    application.inject('component:mtg-data-item', 'itemService', 'mtg-item-service:main');
    application.inject('component:mtg-data-items', 'itemService', 'mtg-item-service:main');
  }};
