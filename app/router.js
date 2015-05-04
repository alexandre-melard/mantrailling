import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('mobile');
  this.route('map-app', {path: '/map'});
  this.route('/beta/map');
});

export default Router;
