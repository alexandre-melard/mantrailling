import Ember from 'ember';

export default Ember.Component.extend({
  classNames: "mtg-data",
  actions: {
    broadcastEvent: function(name, value) {
      this.set('broadcastEvent', 'broadcastEvent');
      this.sendAction('broadcastEvent', name,value);
    }
  }
});
