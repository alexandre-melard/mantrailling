/**
 * Created by alex on 04/04/2015.
 */
import Ember from 'ember';
import tooltip from '../utils/ol-tooltip';
import getRGB from "../utils/color-get-rgb.js";
import calcBrightness from "../utils/color-get-brightness.js";
import colorLuminance from "../utils/color-get-luminance.js";
import getRoute from "../utils/google-route-between-a-and-b.js";

// Geometrie
var TRAILER = "Trailer";
var TEAM = "Team";
var LINE_STRING = "LineString";
var POLYGON = "Polygon";
var MARKER = "Marker";
var POINT = "Point";

var COLORS = [
  ["#ffffff", "#000000", "#eeece1", "#1f497d", "#4f81bd", "#c0504d", "#9bbb59", "#8064a2", "#4bacc6", "#f79646", "#ffff00"],
  ["#f2f2f2", "#7f7f7f", "#ddd9c3", "#c6d9f0", "#dbe5f1", "#f2dcdb", "#ebf1dd", "#e5e0ec", "#dbeef3", "#fdeada", "#fff2ca"],
  ["#d8d8d8", "#595959", "#c4bd97", "#8db3e2", "#b8cce4", "#e5b9b7", "#d7e3bc", "#ccc1d9", "#b7dde8", "#fbd5b5", "#ffe694"],
  ["#bfbfbf", "#3f3f3f", "#938953", "#548dd4", "#95b3d7", "#d99694", "#c3d69b", "#b2a2c7", "#a5d0e0", "#fac08f", "#f2c314"],
  ["#a5a5a5", "#262626", "#494429", "#17365d", "#366092", "#953734", "#76923c", "#5f497a", "#92cddc", "#e36c09", "#c09100"],
  ["#7f7f7f", "#0c0c0c", "#1d1b10", "#0f243e", "#244061", "#632423", "#4f6128", "#3f3151", "#31859b", "#974806", "#7f6000"]
];

export default Ember.Controller.extend({

  needs: ['map', 'mapData'],
  state: null,
  commands: null,
  map: null,
  currentLayer: null,
  olDraw: null,
  select: null,
  modify: null,
  mtgDrawState: null,
  onDrawEnd: null,
  moveListenerKey: null,
  sketch: null,
  sketchLastState: null,
  color: null,
  colors: COLORS,
  resetColor: null,
  popups: [],
  followPathMode: false,
  followPathModeTitle: "Draw with straight lines",
  followPathModeIcon: "plane",

  bindCommand: function () {
    this.set('commands', this.store.all('mtgCommand'));
  }.on('init'),

  onCommandChange: function () {
    var command = this.get('commands').get('lastObject');
    if (command !== undefined) {
      if (command.get('key') === 'map.draw.point') {
        this.drawPoint(command.get('options'))
          .then(function (feature) {
            command.get('value').success(feature);
          })
          .fail(function (reason) {
            command.get('value').fail(reason);
          });
      }
    }
  }.observes('commands'),

  onMapCreated: function () {
    this.set('select', this.createSelect());
    this.set('modify', this.createModify());
  }.observes('map'),

  onGeometryChange: function () {
    var map = this.get('map');
    if (map == null) {
      return;
    }
    map.removeInteraction(this.get('select'));
    map.removeInteraction(this.get('modify'));
    map.removeInteraction(this.get('olDraw'));
    if (this.get('mtgDrawState') === "Modify") {
      tooltip.deleteTooltips(this.get('map'));
      map.addInteraction(this.select);
      map.addInteraction(this.get('modify'));
      this.changeCursorOnFeature();
    } else if (this.get('mtgDrawState') !== null) {
      $(map.getViewport()).off('mousemove');
      this.createDraw();
      map.addInteraction(this.get('olDraw'));
    }
  }.observes('mtgDrawState'),

  changeCursorOnFeature: function () {
    var target = this.get('map').getTarget();
    var map = this.get('map');
    var jTarget = typeof target === "string" ? $("#" + target) : $(target);
    $(this.get('map').getViewport()).on('mousemove', function (e) {
      var pixel = map.getEventPixel(e.originalEvent);
      var hit = map.forEachFeatureAtPixel(pixel, function () {
        return true;
      });
      if (hit) {
        jTarget.css("cursor", "pointer");
      } else {
        jTarget.css("cursor", "");
      }
    });
  },

  createSelect: function () {
    var select = new ol.interaction.Select();

    // grab the features from the select interaction to use in the modify interaction
    var features = select.getFeatures();

    // when a feature is selected...
    features.on('add', function () {
      var vector = this.get('currentLayer');

      // listen to pressing of delete key, then delete selected features
      $(document).on('keyup', function (event) {
        if (event.keyCode === 46) {

          // remove all selected features from select and vector
          features.forEach(function (feature) {
            features.remove(feature);
            var vectorFeatures = vector.getSource().getFeatures();
            vectorFeatures.forEach(function (sourceFeature) {
              if (sourceFeature === feature) {
                vector.getSource().removeFeature(sourceFeature);
              }
            });
          });
        }
      });
    }, this);
    return select;
  },

  createModify: function () {
    var select = this.get('select');
    return new ol.interaction.Modify({
      features: select.getFeatures(),
      // the SHIFT key must be pressed to delete vertices, so
      // that new vertices can be drawn at the same position
      // of existing vertices
      deleteCondition: function (event) {
        return ol.events.condition.shiftKeyOnly(event) &&
          ol.events.condition.singleClick(event);
      }
    });
  },

  createDraw: function () {
    var currentLayer = this.get('currentLayer');
    var source = currentLayer.getSource();
    var geometry = this.get('mtgDrawState');
    if (this.get('mtgDrawState') === TRAILER || this.get('mtgDrawState') === TEAM) {
      geometry = LINE_STRING;
    } else if (this.get('mtgDrawState') === MARKER) {
      geometry = POINT;
    }
    this.set('olDraw', new ol.interaction.Draw({
      source: source,
      type: /** @type {ol.geom.GeometryType} */ (geometry)
    }));
    tooltip.createTooltips(this.get('map'), this.get('sketch'));

    this.get('olDraw').on('drawstart',
      function (evt) {
        // set sketch
        var feature = evt.feature;
        var geom = feature.getGeometry();
        this.set('sketch', feature);
        tooltip.sketch = feature;
        $('#map').on('keyup', function (event) {
          if (event.keyCode === 27) {
            if (geom.getType() === LINE_STRING) {
              geom.setCoordinates(geom.getCoordinates().slice(0, geom.getCoordinates().length - 1));
            }
          }
        });
        var me = this;
        $('#map').on('mouseup', function (event) {
          if (geom.getType() === LINE_STRING && me.followPathMode) {
            var coords = geom.getCoordinates();
            var len = coords.length;
            if (len > 1) {
              var start = coords[len - 2];
              var end = coords[len - 1];
              getRoute(start, end).then(function (route) {
                coords = coords.slice(0, len - 1);
                coords = coords.concat(route);
                geom.setCoordinates(coords);
              });
            }
          }
        });
      }, this);

    this.get('olDraw').on('drawend', function (e) {
      e.feature.set('specificType', this.get('mtgDrawState'));
      if (this.get('color') !== null) {
        e.feature.set('color', this.get('color'));
      }
      tooltip.deleteTooltips(this.get('map'));
      this.set('sketch', null);
      tooltip.sketch = null;
      this.set('mtgDrawState', null);
      $('#map').off('mouseup');
      $('#map').off('keyup');
      if (this.get('onDrawEnd') !== null) {
        this.get('onDrawEnd')(e.feature);
      }
    }, this);
    return this.get('olDraw');
  },

  sketchSaveState: function () {
    var sketch = this.get('sketch');
    var sketchLastState = this.get('sketchLastState');
    if (sketch === sketchLastState) {
      return;
    }
    this.set('sketchLastState', sketch);
  }.observes('sketch'),

  handleSketchFinish: function () {
    var sketch = this.get('sketch');
    // Wait for sketch to be drawn
    if (sketch === null) {
      sketch = this.get('sketchLastState');
      if (this.get('mtgDrawState') === MARKER) {
        var popup = this.container.lookup('component:map-popup', {singleton: false});
        popup.set('feature', sketch);
        popup.set('map', this.get('map'));
        popup.append();
        this.get('popups').pushObject(popup);
      }
    }
  }.observes('sketch'),

  init: function () {
    this._super();
    this.get('controllers.map').addObserver('map', this, function (sender) {
      this.set('map', sender.get('map'));
    });
    this.get('controllers.map').addObserver('currentLayer', this, function (sender) {
      this.set('currentLayer', sender.get('currentLayer'));
    });
    this.mapDrawService.register(this);
  },

  drawPoint: function (options) {
    var me = this;
    return new Promise(function (resolve, error) {
      if (options.location !== undefined) {
        var feature = new ol.Feature({
          geometry: new ol.geom.Point(options.location),
          name: 'GPS Tracker'
        });
        if (options.removeFeature !== undefined) {
          me.get('currentLayer').getSource().removeFeature(options.removeFeature);
        }
        me.get('currentLayer').getSource().addFeature(feature);
        feature.set('color', options.color);
        feature.set("label", options.label);
        feature.set("radius", options.radius);
        feature.set("opacity", options.opacity);

        resolve(feature);
      } else {
        var color = me.get('color');
        me.changeColor(options.color);
        me.set('resetColor', color);
        me.set('mtgDrawState', POINT);
        me.set('onDrawEnd', function (feature) {
          if (me.get('resetColor') !== null) {
            me.changeColor(me.get('resetColor'));
            me.set('resetColor', null);
          }
          feature.set("label", options.label);
          feature.set("radius", options.radius);
          feature.set("opacity", options.opacity);
          me.set('onDrawEnd', null);
        });
      }
      resolve(feature);
    });
  },

  changeColor: function (color) {
    this.set('color', color);
    console.log("color modified:" + color);

    var setBtnColor = function (color) {
      var brigthness = calcBrightness(getRGB(color));
      $('.btn-Color').css("background-color", color);
      $('.btn-Color').css("color", (brigthness < 220) ? "#ffffff" : "#000000");
      console.log("color modified:" + color + " (brightness: " + brigthness + ")");
    };

    setBtnColor(color);
    var darker = colorLuminance(color, -0.5);
    $('.btn-Color').hover(function () {
      setBtnColor(darker);
    }, function () {
      setBtnColor(color);
    });
  },

  actions: {
    toggleDraw: function (state) {
      this.set('mtgDrawState', state);
    },

    toggleModify: function () {
      if (this.get('mtgDrawState') === 'Modify') {
        $(".mtg-modify").removeClass("active");
        this.set('mtgDrawState', null);
      } else {
        $(".mtg-modify").addClass("active");
        this.set('mtgDrawState', 'Modify');
      }
    },
    toggleFollowPathMode: function () {
      this.toggleProperty('followPathMode');
      if (this.get('followPathMode')) {
        this.set('followPathModeTitle', "Follow the roads and path");
        this.set('followPathModeIcon', "road");
      } else {
        this.set('followPathModeTitle', "Draw with straight lines");
        this.set('followPathModeIcon', "plane");
      }
      // Fix tooltip
      $('.map-draw-follow-path').tooltip('hide')
        .attr('data-original-title', this.get('followPathModeTitle'))
        .tooltip('fixTitle')
        .tooltip('show');
    },

    changeColor: function (color) {
      this.changeColor(color);
    }
  }
});
