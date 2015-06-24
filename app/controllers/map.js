import Ember from 'ember';
import getStyleFunction from "../utils/map-style";
import conf from "../config/environment";
import file from "../utils/file-io";

/**
 * Created by alex on 29/03/2015.
 */
export default Ember.Controller.extend({
  needs: ["mapLayers"],
  mapLayers: Ember.computed.alias("controllers.mapLayers"),
  map: null,
  currentLayer: null,
  basicURL: conf.basicURL,
  expertURL: conf.expertURL,
  isScreenshotLoading: false,

  bindCommand: function () {
    this.command.register(this, 'map.view.extent.fit', function(options) {
      var map = this.get('map');
      var layer = this.get('currentLayer');
      return new Promise(function (resolve, error) {
        map.getView().fitExtent( layer.getSource().getExtent(), (map.getSize()));
        resolve(true);
      });
    });
  }.on('init'),


  createMap: function () {
    return new ol.Map({
      target: 'map',
      view: new ol.View({
        center: ol.proj.transform([5.1475, 45.6329], 'EPSG:4326', 'EPSG:3857'),
        zoom: 15
      })
    });
  },

  createVectorSource: function (features) {
    var vectorSource = null;
    if (features !== undefined && features !== null) {
      vectorSource = new ol.source.GPX({object: features});
    } else {
      vectorSource = new ol.source.Vector();
    }
    return vectorSource;
  },

  createVector: function (source) {
    return new ol.layer.Vector({
      source: source
    });
  },

  changeCurrentLayer: function (layer) {
    if (layer === undefined || layer === null) {
      var source = this.createVectorSource();
      layer = this.createVector(source);
      layer.setStyle(getStyleFunction(this.command, this.i18n));
    } else if (this.map !== null) {
      this.map.removeLayer(this.currentLayer);
    }
    if (this.map !== null) {
      if (this.currentLayer !== null) {
        this.map.removeLayer(this.currentLayer);
      }
      this.map.addLayer(layer);
    }
    this.set('currentLayer', layer);
    return layer;
  },


  build: function () {
    var me = this;
    this.set('map', this.createMap());
    window.gMap = this.map;
    this.get('mapLayers').loadLayers().then(function (layers) {
      var map = me.get('map');
      var vectors = [];
      if (map.getLayers().get('length') !== 0) {
        // Save current vecotr used for drawing
        map.getLayers().getArray().forEach(function(vector) {
          vectors.push(vector);
          map.removeLayer(vector);
        });
      }
      // set Tile layers
      layers.forEach(function(layer) {
        map.addLayer(layer.layer);
      });
      // restore vectors
      vectors.forEach(function(vector) {
        map.addLayer(vector);
      });
      if (me.currentLayer !== null) {
        me.changeCurrentLayer(me.currentLayer);
      }
    });
  },

  actions: {
    screenshot: function() {
      var map = this.get('map');
      var me = this;
      console.log("screenshot loading");
      this.set("isScreenshotLoading", true);
      setTimeout(function () {
        $('#map >> canvas').cropper({
          guides: false,
          zoomable: false,
          mouseWheelZoom: false,
          built: function () {
            document.addEventListener('keyup', function(event) {
              if (event.keyCode === 27) {
                $('#screenshot-box-buttons').appendTo("#container");
                me.set("displayScreenshot", false);
                $('#map >> canvas').cropper("destroy");
                $("#screenshot-box-buttons").find("button").off('click');
              }
            });

            var topLeft = map.getPixelFromCoordinate(me.get("currentLayer").getSource().getExtent().slice(0, 2));
            var bottomRight = map.getPixelFromCoordinate(me.get("currentLayer").getSource().getExtent().slice(2, 4));
            $("#map >> canvas").cropper("setCropBoxData",
              {
                "left": topLeft[0] - 30,
                "top": bottomRight[1] - 30,
                "width": bottomRight[0] - topLeft[0] + 60,
                "height": topLeft[1] - bottomRight[1] + 60
              }
            );

            me.set("displayScreenshot", true);
            $('#screenshot-box-buttons').appendTo(".cropper-crop-box");
            $("#screenshot-box-buttons").find("button.save").on('click', function () {
              var data = $('#map >> canvas').cropper("getCroppedCanvas").toDataURL('image/png');
              file.write(data, "carte", "png", "image/png");
              $('#screenshot-box-buttons').appendTo("#container");
              me.set("displayScreenshot", false);
              $('#map >> canvas').cropper("destroy");
              $("#screenshot-box-buttons").find("button").off('click');
            });
            $("#screenshot-box-buttons").find("button.facebook").on('click', function () {

              var data = $('#map >> canvas').cropper("getCroppedCanvas").toDataURL('image/png');
              var blob;
              try {
                var byteString = atob(data.split(',')[1]);
                var ab = new ArrayBuffer(byteString.length);
                var ia = new Uint8Array(ab);
                for (var i = 0; i < byteString.length; i++) {
                  ia[i] = byteString.charCodeAt(i);
                }
                blob = new Blob([ab], {type: 'image/png'});
              } catch (e) {
                console.log(e);
              }
              var fd = new FormData();
              fd.append("source", blob);
              var text = "Nom: " + $("#map-info-trail-name").text().trim();
              text += "\nNiveau: " + $("#map-info-trail-level").text().trim();
              text += "\nLongueur: " + $("#map-info-trail-length").text().trim();
              text += "\nNombre d'objets: " + $("#map-info-trail-items").text().trim();
              text += "\nGPS: " + $("#map-info-trail-location").text().trim();
              fd.append("message", text);
              FB.login(function(){
                var auth = FB.getAuthResponse();
                $.ajax({
                  url:"https://graph.facebook.com/"+auth.userID+"/photos?access_token=" + auth.accessToken,
                  type:"POST",
                  data:fd,
                  processData:false,
                  contentType:false,
                  cache:false,
                  success:function(data){
                    console.log("success " + data);
                  },
                  error:function(shr,status,data){
                    console.log("error " + data + " Status " + shr.status);
                  },
                  complete:function(){
                    console.log("Ajax Complete");
                  }
                });
                $('#screenshot-box-buttons').appendTo("#container");
                me.set("displayScreenshot", false);
                $('#map >> canvas').cropper("destroy");
                $("#screenshot-box-buttons").find("button").off('click');
              }, {scope: 'publish_actions'});
            });
            me.set("isScreenshotLoading", false);
            console.log("screenshot loaded");
          }
        });
      });
    }
  }
});
