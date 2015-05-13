import Ember from 'ember';
import AfterRender from '../mixins/after-render';

export default Ember.View.extend(AfterRender, {
  afterRenderEvent: function() {
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
  }
});
