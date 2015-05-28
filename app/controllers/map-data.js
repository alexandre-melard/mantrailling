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
  attributeBindings: ['name'],
  draw: Ember.computed.alias("controllers.mapDraw"),
  map: null,
  addTrailName: null,
  trails: [],
  formats: [consts.GPX],
  levels: [],
  itemTypes: ['Cloth', 'Leather', 'Cardboard', 'Plastic'],
  currentItem: {position: 'P', type: 'Cloth', description: null},
  items: [],

  onCreatePathStart: function (type, options) {
    var me = this;
    return new Promise(function (resolve) {
      var ls = me.store.createRecord('mapLinestring', {
        type: consts.TRAILER,
        feature: options.feature,
        map: options.map,
        layer: options.layer
      });
      var last = me.get('selectedTrail').get(type);
      if (last !== null) {
        last.removeFromMap(me.get('selectedTrail').layer);
      }
      me.get('selectedTrail').set(type, ls);
      resolve(ls);
    });
  },

  onCreatePathEnd: function (type) {
    var me = this;
    return new Promise(function (resolve) {
      var ls = me.get('selectedTrail').get(type);
      ls.exportToGPX();
      resolve(ls);
    });
  },

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

  bindCommand: function () {
    var me = this;
    this.command.register(this, 'map.draw.change', function () {
      console.log("detected change in draw, exporting trail");
      var trail = me.get('selectedTrail');
      return new Promise(function (resolve) {
        trail.export();
        resolve(true);
      });
    });
    this.command.register(this, 'map.draw.linestring.create', function (options) {
      var feature = options.feature;
      var trail = me.get('selectedTrail');
      return new Promise(function (resolve) {
        me.getOrCreateMapDraw().then(function (mapDraw) {
          var ls = me.store.createRecord('mapLinestring');
          ls.layer = trail.layer;
          ls.feature = feature;
          ls.exportGeoJSON();
          mapDraw.get('lineStrings').pushObject(ls);
          resolve(ls);
        });
      });
    });
    this.command.register(this, 'map.linestring.change', function (options) {
      return new Promise(function () {
        var geometry = options.feature.getGeometry();
        var length = formatLength(me.get('map').getView().getProjection(), geometry);
        if (options.feature.get('label') !== length) {
          options.feature.set('label', length);
          if (options.feature.get('extensions').type === consts.TRAILER) {
            me.command.send('map.info.length', {
              length: length
            });
            me.command.send('map.info.location', {
              location: ol.coordinate.toStringHDMS(
                ol.proj.transform(geometry.getFirstCoordinate(), 'EPSG:3857', 'EPSG:4326')
              )
            });
          }
        }
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
    this.command.register(this, 'map.info.length', function (options) {
      return new Promise(function (resolve) {
        me.get('selectedTrail').set('length', options.length);
        resolve(true);
      });
    });
    this.command.register(this, 'map.info.location', function (options) {
      return new Promise(function (resolve) {
        me.get('selectedTrail').set('location', options.location);
        resolve(true);
      });
    });
  }.on('init'),

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

  getData: function (formatName, layer) {
    // define a format the data shall be converted to
    var format = new ol.format[formatName]();
    // this will be the data in the chosen format
    var data;
    try {
      // convert the data of the vector_layer into the chosen format
      data = format.writeFeatures(layer.getSource().getFeatures());
    } catch (e) {
      // at time of creation there is an error in the consts.GPX format (18.7.2014)
      console.log(e.name + ": " + e.message);
      return;
    }
    return data;
  },

  addTrail: function () {
    var me = this;
    return this.store.find('mtgLevel', {index: 0}).then(function (levels) {
      var level = levels.objectAt(0);
      var trail = me.store.createRecord('mtgTrail', {
        name: me.get('addTrailName'),
        level: level
      });
      level.set('selected', true);
      me.trails.pushObject(trail);
      trail.set('selected', true);
      trail = me.changeActiveTrail(trail);
      return trail;
    });
  },

  exportTrace: function (format, trace) {
    var data = trace.serialize(format);
    file.write(data, "trace", format);
  },

  exportTrail: function (trail) {
    var data = trail.serialize();
    file.write(data, trail.get('name'), "cmp");
  },

  mapImportTrailer: function () {
    this.importTrace(consts.TRAILER, this.get('selectedTrail'));
  },

  mapImportTeam: function () {
    this.importTrace(consts.TEAM, this.get('selectedTrail'));
  },

  importTrace: function (type, trail) {
    var me = this;
    file.read(function(gpx) {
      var mapLineString = trail.get(type);
      if (mapLineString === null) {
        mapLineString = me.store.createRecord('mapLinestring');
        trail.set(type, mapLineString);
      }
      mapLineString.removeFromMap(me.get('controllers.map').get('currentLayer'));

      // set linestring type, used in map info for example
      mapLineString.importGPX(gpx, consts.style[type]).then(function (feature) {
        feature.get('extensions').type = type;

        // add the feature to the feature's layer
        trail.get('layer').getSource().addFeature(feature);

        // Mise à jour de la longueur de piste
        me.command.send("map.linestring.change", {feature: feature});

        var options = {
          layer: trail.get('layer')
        };
        me.command.send('map.view.extent.fit', options);
      });
    });
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
        vectorLayer.setStyle(getStyleFunction(me.get('map'), me.command));
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
    var me = this;
    this.store.find('mtgLevel').then(function (storedLevels) {
      if (storedLevels.get('length') === 0) {
        var brevet = me.store.createRecord('mtgLevel', {name: consts.BREVET, index: 0}).save();
        me.get('levels').pushObject(brevet);
        var lvl1 = me.store.createRecord('mtgLevel', {name: consts.LVL1, index: 1}).save();
        me.get('levels').pushObject(lvl1);
        var lvl2 = me.store.createRecord('mtgLevel', {name: consts.LVL2, index: 2}).save();
        me.get('levels').pushObject(lvl2);
        var lvl3 = me.store.createRecord('mtgLevel', {name: consts.LVL3, index: 3}).save();
        me.get('levels').pushObject(lvl3);
      } else {
        me.set('levels', storedLevels.sortBy('index'));
      }
    });
  },

  addItem: function () {
    var items = this.get('selectedTrail').get('items');
    this.get('currentItem').index = (items.get('length') + 1);
    var mtgItem = this.store.createRecord('mtgItem', this.get('currentItem'));
    this.get('selectedTrail').get('items').pushObject(mtgItem);
    console.log('new item created ' + mtgItem.get('index'));
    this.set('currentItem', {position: 'P', type: '', description: null});
  },

  deleteItem: function (item) {
    item.deleteRecord();
    this.get('selectedTrail').get('itemAtPoints').removeObject(item);
  },

  addTrace: function(type) {
    var me = this;
    consts.style[type].type = type;
    this.command.send("map.draw.linestring", consts.style[type], function (feature) {
      me.onCreatePathStart(type, {
        feature: feature,
        map: me.get('map'),
        layer: me.get('controllers.map').get('currentLayer')
      }).then(function () {
        me.onCreatePathEnd(type);
      });
    });
  },

  actions: {
    command: function (command, options) {
      var me = this;
      if (command === "data.trailer.create") {
        this.addTrace(consts.TRAILER);
      } else if (command === "data.team.create") {
        this.addTrace(consts.TEAM);
      } else if (command === "trail.add") {
        this.addTrail();
      } else if (command === "trail.open") {
        this.importTrail(options);
      } else if (command === "trail.delete") {
        this.deleteTrail(options);
      } else if (command === "trail.export") {
        this.exportTrail(options);
      } else if (command === "trail.trailer.import") {
        this.mapImportTrailer(options);
      } else if (command === "trail.team.import") {
        this.mapImportTeam(options);
      }
    },
    changeTrack: function (trail) {
      this.changeActiveTrail(trail);
    },
    changeLevel: function (level) {
      this.get('levels').forEach(function (level) {
        level.set('selected', false);
      });
      level.set('selected', true);
      this.get('selectedTrail').set('level', level);
    },
    addItem: function () {
      this.addItem();
    },
    deleteItem: function (item) {
      this.deleteItem(item);
    },
    save: function (trail) {
      this.command.send('save', null, function () {
        console.log(trail.get('name') + ".save :: success");
      }, function (e) {
        console.log(trail.get('name') + ".save :: failure: " + e);
      });
    },
    exportTrace: function (format, trail) {
      this.exportTrace(format, trail);
    }
  }
});
