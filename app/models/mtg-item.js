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

  serialize: function () {
    var data = {};
    data.id = this.id;
    data.index = this.get('index');
    data.location = this.get('location').serialize();
    data.position = this.get('position');
    data.type = this.get('type');
    data.description = this.get('description');
    return data;
  },

  unserialize: function (json) {
    var me = this;
    this.set("index", json.index);
    if (json.location !== undefined) {
      me.store.find('mapPoint', json.location.id).then(function (mapPoint) {
        me.set('location', mapPoint);
      }, function () {
        var mapPoint = me.store.createRecord('mapPoint');
        mapPoint.importGeoJSON(json.location);
        me.set('location', mapPoint);
      });
    }
    this.set("position", json.position);
    this.set("type", json.type);
    this.set("description", json.description);
    return this;
  }
});
