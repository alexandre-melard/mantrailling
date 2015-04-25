import Ember from 'ember';

export default Ember.View.extend({
  build: function () {

    // Fix Ember to resize the map fullscreen
    $.each($('#map').parents(), function (index, parent) {
      $(parent).height("100%");
    });

    var mapCtrl = this.get('controller');
    mapCtrl.build();

    $('[data-toggle="tooltip"]').tooltip({
      container: 'body',
      placement: 'bottom'
    });
  }.on('didInsertElement')
});

