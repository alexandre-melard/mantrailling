import Ember from 'ember';

export default Ember.Component.extend({
  name: null,
  levels: null, //injected by the mtg-data component

  actions: {
    addLevel: function() {
      var level = this.levelService.addLevel(this.name);
      this.get('model').set('level', level);
    }
  }
});
