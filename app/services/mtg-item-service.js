import Ember from 'ember';

export default Ember.Service.extend({
  store: null,

  init: function() {
    this._super();
    this.set('store', this.container.lookup("store:main"));
  },

  addItem: function(index, location, position, type, description) {
    var record = this.store.createRecord('mtgItem',
      {
        index: index,
        location: location,
        position: position,
        type: type,
        description: description
      });
    record.save();
    console.log('item added');
    return record;
  },

  updateItem: function(item) {
    item.save();
    console.log('item updated');
  },

  deleteItem: function(item) {
    item.destroyRecord();
    console.log('item destroyed');
  },

  getItems: function(callback) {
    this.store.find('mtgItem').then(callback);
    console.log('getItems');
  }
});
