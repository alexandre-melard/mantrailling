/**
 * Created by alex on 04/04/2015.
 */
import Ember from 'ember';
import autocomplete from '../utils/google-geocoder-autocomplete.js';

export default Ember.View.extend({
  templateName: "mapLocation",
  classNames: ["input-group", "input-group-sm", "map-location"],
  autocomplete: function() {
    var auto = autocomplete($(".map-location-search-input")[0]);
  }.on('didInsertElement')
});
