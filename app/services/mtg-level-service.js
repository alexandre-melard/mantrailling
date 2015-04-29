import Ember from 'ember';

export default Ember.Service.extend({
  store: null,

  init: function() {
    this._super();
    this.set('store', this.container.lookup("store:main"));
    this.initLevels(); // Prepare the levels if the user didn't customize them
  },

  addLevel: function(name) {
    var record = this.store.createRecord('mtgLevel',{name: name});
    record.save();
    console.log('level added');
    return record;
  },

  updateLevel: function(level) {
    level.save();
    console.log('level updated');
  },

  deleteLevel: function(level) {
    level.destroyRecord();
    console.log('level deleted');
  },

  getLevels: function() {
    console.log('getLevels');
    return this.store.find('mtgLevel');
  },

  initLevels: function() {
    var store = this.get('store');
    this.store.find('mtgLevel').then(function(levels) {
      if (levels.get('length') === 0) {
        ['Basic', 'Intermediate', 'Advanced', 'Master'].forEach(function(level) {
          console.log(level);
          store.createRecord('mtgLevel',{name: level}).save();
        });
      }
    });
    console.log('initLevels');
  }
});
