import Ember from 'ember';

export default Ember.View.extend({
  build: function () {
    $('[data-toggle="tooltip"]').tooltip({
      container: 'body',
      placement: 'right'
    });
  }.on('didInsertElement')
});

