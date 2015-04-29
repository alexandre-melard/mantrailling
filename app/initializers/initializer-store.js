export default {
  name: 'initializer-store',
  after: ['store', 'initializer-mtg-level'],

  initialize: function(container, application) {
    application.inject('service:mtg-level-service', 'store', 'store:main');
  }
};
