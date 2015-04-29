import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.store.find("mtgLevel");
  },
  actions: {
    deleteLevel: function(level) {
      this.controller.delete(level);
    },
    updateLevel: function(level) {
      this.controller.update(level);
    }
  }
});
