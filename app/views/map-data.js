/**
 * Created by alex on 04/04/2015.
 */
import Ember from 'ember';

export default Ember.View.extend({
  templateName: "mapData",
  classNames: ["map-data"],
  handleFileEvents: function() {
    var ctrl = this.get('controller');
    $('#map-data-import-trailer-input').on('change', function(evt) {
      ctrl.mapImportTrailerFile(evt);
    });
    $('#map-data-import-team-input').on('change', function(evt) {
      ctrl.mapImportTeamFile(evt);
    });
  }.on('didInsertElement')
});
