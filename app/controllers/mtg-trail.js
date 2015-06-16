/**
 * Created by alex on 04/04/2015.
 */
import Ember from 'ember';
import * as consts from '../utils/map-constants';
import getStyleFunction from "../utils/map-style";
import formatLength from "../utils/map-format-length";
import file from "../utils/file-io";

export default Ember.Controller.extend({

  needs: ['map', 'mapDraw'],
  layer: Ember.computed.alias("controllers.map.currentLayer"),
  map:  Ember.computed.alias("controllers.map.map"),
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
  //selectedTrail: Ember.computed('trails.@each.selected', {
  //  get: function () {
  //    if (this.get('trails').length === 0) {
  //      console.log("no trail has been defined yet, please create a trail first");
  //      return false;
  //    }
  //    return this.get('trails').findBy('selected', true);
  //  },
  //  set: function (key, value) {
  //    var me = this;
  //    if (this.get('trails').length === 0) {
  //      console.log("no trail has been defined yet, please create a trail first");
  //      return false;
  //    }
  //    this.get('trails').forEach(function (t) {
  //      if (t === value) {
  //        t.set('selected', true);
  //      } else {
  //        t.set('selected', false);
  //      }
  //    }, this);
  //  }
  //}),
  //
  selectedTrail: function (key, value, previousValue) {
    if (this.get('trails').length === 0) {
      console.log("no trail has been defined yet, please create a trail first");
      return null;
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
    trail.set('selected', true);
    trail.set('level', this.store.find('mtgLevel', {index: 0}));
    trail = this.changeActiveTrail(trail);
    this.trails.pushObject(trail);
    return trail;
  },

  exportTrail: function (trail) {
    trail.serialize().then(function (data) {
      file.write(data, trail.get('name'), "cmp");
    });
  },

  importTrail: function (options) {
    var me = this;
    file.read('cmp', function (data) {
      var json = JSON.parse(data);
      me.store.find('mtgTrail', json.id).then(function (mtgTrail) {
        console.log('trail exists already');
      }, function () {
        me.store.createRecord('mtgTrail').unserialize(json, me.get("layer")).then(function (mtgTrail) {
          mtgTrail.save();
          me.get('trails').pushObject(mtgTrail);
          me.set("selectedTrail", mtgTrail);
        });
      });
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
        vectorLayer.setStyle(getStyleFunction(me.command, me.i18n));
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
    this.get('trails').removeObject(trail);
    this.set('selectedTrail', this.get('trails').get('firstObject'));

    this.command.send('mtg.trail.remove', {id: trail.id, layer: this.get('layer'), map: this.get('map')});

    // saving state
    this.command.send('save');
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
  },

  actions: {
    addTrailAction: function() {
      this.addTrail();
    },
    deleteTrailAction: function(trail) {
      this.deleteTrail(trail);
    },
    importTrailAction: function() {
      this.importTrail();
    },
    exportTrailAction: function(trail) {
      this.exportTrail(trail);
    },
    command: function (command, options) {
      if (command === "trail.add") {
        this.addTrail();
      } else if (command === "trail.open") {
        this.importTrail(options);
      } else if (command === "trail.delete") {
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
