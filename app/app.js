import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';

var App;

Ember.MODEL_FACTORY_INJECTIONS = true;

App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver: Resolver
});

loadInitializers(App, config.modulePrefix);

Ember.Route.reopen({
  beforeModel: function(transition){
    var me = this;
    [ 'mapDraw',
      'mapLayer',
      'mapLinestring',
      'mapPoint',
      'mapPolygon',
      'mtgItem',
      'mtgLevel',
      'mtgTrail'].forEach(function(model) {
//        me.store.query(model);
      });
  }
});

Ember.View.reopen({
  init: function() {
    this._super();
    var self = this;

    // bind attributes beginning with 'data-'
    Ember.keys(this).forEach(function(key) {
      if (key.substr(0, 5) === 'data-') {
        self.get('attributeBindings').pushObject(key);
      }
    });
  }
});

export default App;
