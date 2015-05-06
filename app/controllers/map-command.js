/**
 * Created by alex on 22/04/2015.
 */
import Ember from 'ember';

export default Ember.Controller.extend({
  commands: [],
  registered: [],

  loadStore: function () {
    this.set('store', this.container.lookup('store:main'));
  }.on('init'),

  unregister: function (who, what, callback) {

  },

  register: function (who, what, callback) {
    var registered = this.get('registered');
    registered.pushObject({
      who: who,
      what: what,
      callback: callback
    });
  },

  notify: function () {
    var registered = this.get('registered');
    var commands = this.get('commands');
    var command = commands.objectAt(commands.get('length') - 1);
    registered.forEach(function (register) {
      if (command.key === register.what) {
        register.callback.apply(register.who, [command.options])
          .then(function (result) {
            if (command.resolve !== undefined) {
              command.resolve(result);
            }
          }, function (reason) {
            if (command.failure !== undefined) {
              command.failure(reason);
            }
          });
      }
    });
  }.observes('commands.@each'),

  send: function (key, options, resolve, failure) {
    var commands = this.get('commands');
    console.log('sending command: ' + key + ' with options: ' + JSON.stringify(options));
    commands.pushObject({
      key: key,
      options: options,
      resolve: resolve,
      failure: failure
    });
  }
});
