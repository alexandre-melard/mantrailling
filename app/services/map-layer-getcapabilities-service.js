import Ember from 'ember';

export default Ember.Service.extend({
  getWMTSGetCapabilities: function () {
    var parser = new ol.format.WMTSCapabilities();
    return new Promise(function(resolve, error) {
      $.ajax('assets/data/GetCapabilities.xml')
        .done(function (response) {
          var result = parser.read(response);
          resolve({layers: result.Contents.Layer.reverse(), tms: result.Contents.TileMatrixSet[0]});
        })
        .fail(function (e) {
          error(console.log("could not load getcapabilities" + e));
        });
    });
  }

});
