import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    updateLevel: function() {
      this.levelService.updateLevel(this.get('model'));
    },
    deleteLevel: function() {
      this.levelService.deleteLevel(this.get('model'));
    }
  }
});
