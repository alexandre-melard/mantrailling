/**
 * Created by alex on 29/04/2015.
 */
import Ember from 'ember';

export default Ember.Route.extend({
  redirect: function(){
    this.transitionTo('map');
  }
});
