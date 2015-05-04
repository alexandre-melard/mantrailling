/**
 * Created by alex on 22/04/2015.
 */
import Ember from 'ember';

export default Ember.Controller.extend({

  loadStore: function() {
    this.set('store', this.container.lookup('store:main'));
  }.on('init'),

  send: function (options) {
    var commands = this.store.all('mtgCommand');
    commands.pushObject({
      key: options.key,
      options: options.value
    });
    console.log('sending command :' + options.key);
  }
});
