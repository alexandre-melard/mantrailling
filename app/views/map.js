import Ember from 'ember';

export default Ember.View.extend({
  didInsertElement: function() {
    // call jquery tooltip at the end
    Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);

    // Fix Ember to resize the map fullscreen
    $.each($('#map').parents(), function (index, parent) {
      $(parent).height("100%");
    });
    this.get('controller').build();
  },

  afterRenderEvent: function() {
    $('body').tooltip({
      selector: '[data-toggle="tooltip"]',
      container: 'body',
      placement: 'bottom'
    });
    $('button').on("click", function() {
      $(this).tooltip('toggle');
    });
  }
});
