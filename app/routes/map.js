import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return {
      layers: this.store.find('mapLayer'),
      trails: this.store.find('mtgTrail'),
      levels: this.store.find('mtgLevel')
    }
  }
});
