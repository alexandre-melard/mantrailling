import DS from 'ember-data';

export default DS.Model.extend({
  index: DS.attr('number'),
  location: DS.attr('string'),
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

  serialize: function() {
    var data = {};
    data.id = this.id;
    data.index = this.get('index');
    data.location = this.get('location');
    data.position = this.get('position');
    data.type = this.get('type');
    data.description = this.get('description');
    return data;
  }

});
