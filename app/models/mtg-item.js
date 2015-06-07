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
  }.on('init'),

  load: function (layer) {
    var mapPoint = this.get('location');
    if (mapPoint !== null) {
      this.store.find('mapPoint', mapPoint.id).then(function (mp) {
        mp.loadGeoJSON(layer);
      });
    }
  },

  delete: function (layer) {
    if (this.get('location') !== null) {
      this.get('location').removeFromMap(layer);
      this.get('location').deleteRecord();
    }
  },

  serialize: function () {
    var data = {};
    data.id = this.id;
    data.index = this.get('index');
    if (this.get('location') !== null) {
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
    if (json.location !== undefined) {
      me.store.find('mapPoint', json.location.id).then(function (mapPoint) {
        me.set('location', mapPoint);
        mapPoint.loadGeoJSON(layer);
      }, function () {
        var mapPoint = me.store.createRecord('mapPoint');
        mapPoint.importGeoJSON(layer, json.location);
        me.set('location', mapPoint);
      });
    }
    this.set("position", json.position);
    this.set("type", json.type);
    this.set("description", json.description);
    return this;
  }
});
