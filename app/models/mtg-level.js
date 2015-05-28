import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  index: DS.attr('number'),
  selected: DS.attr('boolean', {defaultValue: false}),

  bindCommand: function () {
    var me = this;
    this.command.register(this, 'save', function (options) {
      return new Promise(function (resolve) {
        console.log("saving mtg levels");
        me.save();
        resolve(true);
      });
    });
  }.on('init')

});
