/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var mergeTrees = require('broccoli-merge-trees');
var pickFiles = require('broccoli-static-compiler');

var app = new EmberApp();

// Use `app.import` to add additional libraries to the generated
// output files.
//
// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.
//
// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.

app.import('bower_components/ol3/build/ol-debug.js');
app.import('bower_components/ol3/css/ol.css');

app.import('bower_components/jquery-rotate/jquery.rotate.js');

app.import('bower_components/jquery-ui/themes/ui-lightness/jquery-ui.min.css');
app.import('bower_components/jquery-ui/ui/core.js');
app.import('bower_components/jquery-ui/ui/widget.js');
app.import('bower_components/jquery-ui/ui/mouse.js');
app.import('bower_components/jquery-ui/ui/draggable.js');
app.import('bower_components/jquery-ui/ui/resizable.js');

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



module.exports = mergeTrees([app.toTree(), bootstrapFonts]);
