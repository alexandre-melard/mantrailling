import Ember from 'ember';

export default Ember.Service.extend({
  store: null,

  init: function () {
    this._super();
    this.set('store', this.container.lookup("store:main"));
  },

  addTrail: function (name) {
    var record = this.store.createRecord('mtgTrail',
      {
        name: name,
        selected: true
      });
    record.save();
    console.log('trail added: ' + name);
    return record;
  },

  updateTrail: function (trail) {
    trail.save();
    console.log('trail updated');
  },

  deleteTrail: function (trail) {
    trail.destroyRecord();
    console.log('trail deleted');
  },

  getTrails: function () {
    var store = this.store;
    console.log('getTrails');

    // Initialize level to Basic if not set already
    return Promise.all([
      store.find('mtgTrail'),
      store.find('mtgLevel', {name: 'Basic'})
    ]).then(function (values) {
      var trails = values[0];
      console.log('getTrails: trails length: ' + trails.get('length'));
      var level = values[1].toArray()[0];
      console.log('getTrails: level: ' + level.get('name'));
      trails.map(function (trail) {
        if (trail.get('level') === null) {
          trail.set('level', level);
        }
        return trail;
      });
    });
  }
});
