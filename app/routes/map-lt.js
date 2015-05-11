/**
 * Created by alex on 09/05/2015.
 */
export default Ember.Route.extend({
  renderTemplate: function() {
    this.render({ controller: 'map' });
  }
});
