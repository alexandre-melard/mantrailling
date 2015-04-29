import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    updateItem: function() {
      this.itemService.updateItem(this.get('model'));
    },
    deleteItem: function() {
      this.itemService.deleteItem(this.get('model'));
    }
  }
});
