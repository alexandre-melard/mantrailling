import MapCmd from "../controllers/map-command.js";

export default {
  name: 'map-command-initializer',
  initialize: function(container, application) {
    application.register('map-command-initializer:main', MapCmd, { instantiate: true });
    application.inject('controller', 'command', 'map-command-initializer:main');
  }
};

