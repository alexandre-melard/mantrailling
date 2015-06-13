export default({
  name: 'i18n',

  initialize: function(registry, application) {
    application.inject('model', 'i18n', 'service:i18n');
    application.inject('component', 'i18n', 'service:i18n');
  }
});
