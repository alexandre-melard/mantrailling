import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('privacy');
  this.route('mobile');
  this.route('map', {path: '/expert'});
  this.route('mapBasic', {path: '/'});
  this.route('mapMobile', {path: '/m'});
  this.route('/beta/map');
});

export default Router;
