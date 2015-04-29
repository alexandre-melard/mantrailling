import Ember from 'ember';

export default Ember.Component.extend({
  location: null,
  position: null,
  type: null,
  description: null,

  index: function() {
    return this.get('items').get('length');
  }.property('items.@each'),

  actions: {
    addItem: function() {
      var item = this.itemService.addItem(
        this.get('index'),
        this.get('location'),
        this.get('position'),
        this.get('type'),
        this.get('description'));
      this.get('items').pushObject(item);
    }
  }
});
