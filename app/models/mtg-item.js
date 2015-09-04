import DS from 'ember-data';

export default DS.Model.extend({
  index: DS.attr('number'),
  location: DS.belongsTo('mapPoint'),
  position: DS.attr('string'),
  type: DS.attr('string'),
  description: DS.attr('string'),
  trail: DS.belongsTo('mtgTrail'),

  bindCommand: function () {
    var me = this;
    this.command.register(this, 'save', function (options) {
      return new Promise(function (resolve) {
        console.log("saving mtg items");
        me.save();
        resolve(true);
      });
    });
    this.command.register(this, 'mtg.item.remove', function (options) {
      return new Promise(function (resolve) {
        console.log("deleting mtg item");
        if (!Ember.isEmpty(me.get('location'))) {
          me.get('location').removeFromMap(options.layer);
          me.get('location').deleteRecord();
        }
        me.deleteRecord();
        resolve(true);
      });
    });
  }.on('init'),

  load: function (layer) {
    var me = this;
    return new Promise(function(resolve) {
      var mapPoint = me.get('location');
      if (!Ember.isEmpty(mapPoint)) {
        me.store.find('mapPoint', mapPoint.id).then(function (mp) {
         resolve(mp.loadGeoJSON(layer));
        });
      }
    });
  },

  serialize: function () {
    var data = {};
    data.id = this.id;
    data.index = this.get('index');
    if (!Ember.isEmpty(this.get('location'))) {
      data.location = this.get('location').serialize();
    }
    data.position = this.get('position');
    data.type = this.get('type');
    data.description = this.get('description');
    return data;
  },

  unserialize: function (json, layer) {
    var me = this;
    this.set("index", json.index);
    if (!Ember.isEmpty(json.location)) {
      me.store.find('mapPoint', json.location.id).then(function (mapPoint) {
        me.set('location', mapPoint);
        mapPoint.loadGeoJSON(layer);
      }, function () {
        var mapPoint = me.store.createRecord('mapPoint');
        mapPoint.importGeoJSON(layer, json.location.geoJSON);
        me.set('location', mapPoint);
      });
    }
    this.set("position", json.position);
    this.set("type", json.type);
    this.set("description", json.description);
    return this;
  }
});
