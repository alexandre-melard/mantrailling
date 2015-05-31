/**
 * Created by alex on 04/04/2015.
 */
import Ember from 'ember';
import * as consts from '../utils/map-constants.js';
import getStyleFunction from "../utils/map-style.js";
import formatLength from "../utils/map-format-length.js";
import file from "../utils/file-io.js";

export default Ember.Controller.extend({

  needs: ['map', 'mapDraw'],
  map: null,
  addTrailName: null,
  trails: [],
  formats: [consts.GPX],

  getOrCreateMapDraw: function () {
    var me = this;
    return new Promise(function (resolve) {
      var md = me.get('selectedTrail').get('mapDraw');
      if (md === null) {
        var mapDraw = me.store.createRecord('mapDraw', {});
        me.get('selectedTrail').set('mapDraw', mapDraw);
        resolve(mapDraw);
      } else {
        resolve(md);
      }
    });
  },

  bindCommands: function () {
    var me = this;
    this.command.register(this, 'map.draw.change', function () {
      console.log("detected change in draw, exporting trail");
      var trail = me.get('selectedTrail');
      return new Promise(function (resolve) {
        trail.export();
        resolve(true);
      });
    });
    this.command.register(this, 'map.draw.polygon.create', function (options) {
      var feature = options.feature;
      var trail = me.get('selectedTrail');
      return new Promise(function (resolve) {
        me.getOrCreateMapDraw().then(function (mapDraw) {
          var poly = me.store.createRecord('mapPolygon');
          poly.layer = trail.layer;
          poly.feature = feature;
          poly.exportGeoJSON();
          mapDraw.get('polygons').pushObject(poly);
          resolve(poly);
        });
      });
    });
    this.command.register(this, 'map.draw.point.create', function (options) {
      var feature = options.feature;
      var trail = me.get('selectedTrail');
      return new Promise(function (resolve) {
        me.getOrCreateMapDraw().then(function (mapDraw) {
          var point = me.store.createRecord('mapPoint');
          point.layer = trail.layer;
          point.feature = feature;
          point.exportGeoJSON();
          mapDraw.get('points').pushObject(point);
          resolve(point);
        });
      });
    });
  },

  /**
   * Return the selected Trail in Trails' array.
   * If trail param is set, set trails to unselected and provided trail to selected.
   * @param trail
   * @param context
   * @returns {*}
   */
  selectedTrail: function (key, value, previousValue) {
    if (this.get('trails').length === 0) {
      console.log("no trail has been defined yet, please create a trail first");
      return false;
    }
    if (arguments.length <= 1) {
      value = this.get('trails').findBy('selected', true);
    } else {
      this.get('trails').forEach(function (t) {
        if (t === value) {
          t.set('selected', true);
        } else {
          t.set('selected', false);
        }
      }, this);
    }
    return value;
  }.property('trails.@each.selected'),

  addTrail: function () {
    var trail = this.store.createRecord('mtgTrail', {
      name: this.get('addTrailName')
    });
    this.trails.pushObject(trail);
    trail.set('selected', true);
    trail = this.changeActiveTrail(trail);
    return trail;
  },

  exportTrail: function (trail) {
    var data = trail.serialize();
    file.write(data, trail.get('name'), "cmp");
  },

  importTrail: function (options) {
    var me = this;
    file.read(function(data) {
          var trail = me.store.createRecord('mtgTrail');
          trail.import(data);
          trail.save();
          me.get('trails').pushObject(trail);
    });
  },

  loadTrails: function () {
    var me = this;
    var mapController = this.get('controllers.map');
    var trails = this.get('trails');
    var storedTrails = this.store.find('mtgTrail');
    storedTrails.then(function (storedTrails) {
      storedTrails.forEach(function (trail) {
        var vectorSource = mapController.createVectorSource();
        var vectorLayer = mapController.createVector(vectorSource);
        vectorLayer.setStyle(getStyleFunction(me.command));
        trail.layer = vectorLayer;
        trail.load();
        if (trail.get('selected')) {
          me.changeActiveTrail(trail, me);
        }
        trails.pushObject(trail);
      });
    });
  },

  changeActiveTrail: function (trail, context) {
    var me = context;
    if (context === undefined || context === null) {
      me = this;
    }
    var mapCtrl = me.get('controllers.map');
    trail.set('layer', mapCtrl.changeCurrentLayer(trail.get('layer')));
    this.set('selectedTrail', trail);
    if (trail.get('layer').getSource().getFeatures().length > 0) {
      this.command.send('map.view.extent.fit');
    }
    return trail;
  },

  deleteTrail: function (trail) {
    console.log("trail deleted: " + trail.get('name'));
    if (trail.layer !== null) {
      this.get('map').removeLayer(trail.layer);
    }
    this.get('trails').removeObject(trail);
    this.set('selectedTrail', this.get('trails').get('firstObject'));
    trail.destroyRecord();
  },

  init: function () {
    this._super();
    this.bindCommands();
    this.loadTrails();
    var mapCtrl = this.get('controllers.map');
    if (this.get('trails').length > 0) {
      mapCtrl.set('currentLayer', this.trails.objectAt(this.trails.get('length') - 1).get('layer'));
    } else {
      // if no layers yet, create a new one :)
      mapCtrl.changeCurrentLayer(null);
    }
    this.get('controllers.map').addObserver('map', this, function (sender) {
      this.set('map', sender.get('map'));
    });
  },

  actions: {
    command: function (command, options) {
      var me = this;
      if (command === "trail.add") {
        this.addTrail();
      } else if (command === "trail.open") {
        this.importTrail(options);
      } else if (command === "trail.delete") {
        this.deleteTrail(options);
      } else if (command === "trail.export") {
        this.exportTrail(options);
      }
    },
    changeTrack: function (trail) {
      this.changeActiveTrail(trail);
    },
    save: function (trail) {
      this.command.send('save', null, function () {
        console.log(trail.get('name') + ".save :: success");
      }, function (e) {
        console.log(trail.get('name') + ".save :: failure: " + e);
      });
    }
  }
});
