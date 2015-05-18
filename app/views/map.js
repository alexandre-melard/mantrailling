import Ember from 'ember';
import AfterRender from '../mixins/after-render';

export default Ember.View.extend(AfterRender, {
  didInsertElement: function() {
    // Fix Ember to resize the map fullscreen
    $.each($('#map').parents(), function (index, parent) {
      $(parent).height("100%");
    });
    this.get('controller').build();
  },

  afterRenderEvent: function() {
    $('[data-toggle="tooltip"]').tooltip({
      container: 'body',
      placement: 'bottom'
    });
  }
});
