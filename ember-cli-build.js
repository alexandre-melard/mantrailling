var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var mergeTrees = require('broccoli-merge-trees');
var pickFiles = require('broccoli-static-compiler');

module.exports = function(defaults) {
  var app = new EmberApp(defaults);

  app.import('bower_components/ol3/build/ol-debug.js');
  app.import('bower_components/ol3/css/ol.css');

  app.import('bower_components/jquery-rotate/jquery.rotate.js');

  app.import('bower_components/cropper/dist/cropper.css');
  app.import('bower_components/cropper/dist/cropper.js');

  app.import("bower_components/font-awesome/css/font-awesome.css");
  app.import("bower_components/font-awesome/fonts/fontawesome-webfont.eot", { destDir: "fonts" });
  app.import("bower_components/font-awesome/fonts/fontawesome-webfont.svg", { destDir: "fonts" });
  app.import("bower_components/font-awesome/fonts/fontawesome-webfont.ttf", { destDir: "fonts" });
  app.import("bower_components/font-awesome/fonts/fontawesome-webfont.woff", { destDir: "fonts" });
  app.import("bower_components/font-awesome/fonts/fontawesome-webfont.woff2", { destDir: "fonts" });
  app.import("bower_components/font-awesome/fonts/FontAwesome.otf", { destDir: "fonts" });

  app.import('bower_components/bootstrap/js/tooltip.js');
  app.import('bower_components/bootstrap/js/popover.js');
  app.import('bower_components/x-editable/dist/bootstrap3-editable/js/bootstrap-editable.js');

  app.import('bower_components/x-editable/dist/bootstrap3-editable/css/bootstrap-editable.css');
  app.import('bower_components/x-editable/dist/bootstrap3-editable/img/loading.gif', {
    destDir: 'assets/images'
  });
  app.import('bower_components/x-editable/dist/bootstrap3-editable/img/clear.png', {
    destDir: 'assets/images'
  });

  app.import('bower_components/bootstrap/dist/css/bootstrap.css');
  app.import('bower_components/bootstrap/dist/css/bootstrap.css.map', {
    destDir: 'assets'
  });

  var bootstrapFonts = pickFiles('bower_components/bootstrap/dist/', {
    srcDir: '/fonts',
    files: ['*'],
    destDir: '/fonts'
  });

  return mergeTrees([app.toTree(), bootstrapFonts]);

}
