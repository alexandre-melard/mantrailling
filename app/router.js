import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

export default Router.map(function() {
  this.route('map', function() {
    this.route('data', function() {
      this.route('trails', function() {
        this.route('trail');
      });
      this.route('items', function() {
        this.route('item');
      });
      this.route('levels', function() {
        this.route('level');
      });
    });
  });
});
