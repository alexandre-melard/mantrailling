import MapCmd from "../controllers/map-command";

export default({
  name: 'map-command',

  initialize: function(registry, application) {
    application.register('map-command:main', MapCmd, { instantiate: true });
    application.inject('controller', 'command', 'map-command:main');
    application.inject('model', 'command', 'map-command:main');
  }
});

