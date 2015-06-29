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

  register: function (who, what, command, rollback) {
    var registered = this.get('registered');
    registered.pushObject({
      who: who,
      what: what,
      command: command,
      rollback: rollback
    });
  },

  notify: function () {
    var registered = this.get('registered');
    var commands = this.get('commands');
    var command = commands.objectAt(commands.get('length') - 1);
    registered.forEach(function (register) {
      if (command.key === register.what) {
        register.command.apply(register.who, [command.options])
          .then(function (result) {
            if (!Ember.isEmpty(command.resolve)) {
              command.resolve(result);
            }
          }, function (reason) {
            if (!Ember.isEmpty(command.failure)) {
              command.failure(reason);
            }
          });
      }
    });
  }.observes('commands.@each'),

  send: function (key, options, resolve, failure) {
    var commands = this.get('commands');
    console.log('sending command: ' + key);
    commands.pushObject({
      key: key,
      options: options,
      resolve: resolve,
      failure: failure
    });
  }
});
