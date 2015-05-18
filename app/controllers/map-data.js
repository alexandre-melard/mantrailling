/**
 * Created by alex on 04/04/2015.
 */
import Ember from 'ember';
import * as consts from '../utils/map-constants.js';
import getStyleFunction from "../utils/map-style.js";
import formatLength from "../utils/map-format-length.js";

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

  onCreateTrailerStart: function (options) {
    var me = this;
    return new Promise(function (resolve) {
      me.store.createRecord('mapLinestring', {
        type: consts.TRAILER,
        feature: options.feature,
        map: options.map,
        layer: options.layer
      }).save().then(function (trailer) {
        me.get('selectedTrail').get('Trailer').then(function (lastTrailer) {
          if (lastTrailer !== null) {
            lastTrailer.removeFromMap();
          }
          me.get('selectedTrail').set('Trailer', trailer);
          me.get('selectedTrail').save();
          resolve(trailer);
        });
      });
    });
  },

  onCreateTrailerEnd: function (options) {
    var me = this;
    return new Promise(function (resolve) {
      me.get('selectedTrail').get('Trailer').then(function (trailer) {
        trailer.exportToGPX().then(function (gpx) {
          trailer.save();
          resolve(trailer);
        });
      });
    });
  },

  bindCommand: function () {
    var me = this;
    this.command.register(this, 'map.linestring.change', function (options) {
      return new Promise(function (resolve) {
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
    this.command.register(this, 'trailer.create.start', this.onCreateTrailerStart);
    this.command.register(this, 'trailer.create.end', this.onCreateTrailerEnd);
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
        t.save();
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
      trail.save().then(function () {
        console.log(trail.get('name') + ".save :: success");
      }).catch(function (e) {
        console.log(trail.get('name') + ".save :: failure: " + e);
      });
      me.trails.pushObject(trail);
      trail.set('selected', true);
      trail = me.changeActiveTrail(trail);
      return trail;
    });
  },

  exportTrail: function (format, trail) {
    var layer = trail.layer;
    var data = this.getData(format, layer);
    var a = document.createElement("a");
    a.href = window.URL.createObjectURL(new Blob([data], {type: 'application/mantralling'}));
    a.download = trail.get('name') + '.' + format.toLowerCase();
    a.click();
  },

  mapImportTrailerFile: function (evt) {
    this.importTrail(consts.TRAILER, this.get('selectedTrail'), evt);
  },

  mapImportTeamFile: function (evt) {
    this.importTrail(consts.TEAM, this.get('selectedTrail'), evt);
  },

  importTrail: function (type, trail, evt) {
    // Check for the various File API support.
    if (window.File && window.FileReader) {
      // Great success! All the File APIs are supported.
      var f = evt.target.files[0];
      var file = {
        name: f.name,
        type: f.type || 'n/a',
        size: f.size,
        date: f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a'
      };
      console.log('importing ' + f.type + ' file as ' + type);

      var reader = new FileReader();
      var me = this;
      // Closure to capture the file information.
      reader.onload = (function () {
        return function (e) {
          var gpx = e.target.result;
          trail.get(type).then(function (mapLineString) {
            mapLineString.removeFromMap();
            mapLineString.importGPX(gpx, {type: type}).then(function (feature) {
              mapLineString.save();
              var options = {
                layer: trail.get('layer')
              };
              me.command.send('map.view.extent.fit', options);
            });
          });
        };
      })(f);
      // Read in the image file as a text file.
      reader.readAsText(f);
    } else {
      alert('The File APIs are not fully supported in this browser.');
    }
  },

  loadTrails: function () {
    var me = this;
    var mapController = this.get('controllers.map');
    var trails = this.trails;
    var storedTrails = this.store.find('mtgTrail');
    storedTrails.then(function (storedTrails) {
      storedTrails.forEach(function (trail) {
        var vectorSource = mapController.createVectorSource();
        var vectorLayer = mapController.createVector(vectorSource);
        vectorLayer.setStyle(getStyleFunction(me.get('map'), me.command));
        trail.layer = vectorLayer;
        trail.load().then(function () {
          if (trail.get('selected')) {
            me.changeActiveTrail(trail, me);
          }
          trails.pushObject(trail);
        });
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
    mtgItem.save();
    this.get('selectedTrail').get('items').pushObject(mtgItem);
    console.log('new item created ' + mtgItem.get('index'));
    this.set('currentItem', {position: 'P', type: '', description: null});
  },

  deleteItem: function (item) {
    item.destroyRecord();
    this.get('selectedTrail').get('itemAtPoints').removeObject(item);
  },

  actions: {
    command: function (command) {
      var me = this;
      if (command === "data.trailer.create") {
        this.command.send("map.draw.linestring", consts.style[consts.TRAILER], function (feature) {
          me.onCreateTrailerStart({
            feature: feature,
            map: me.get('map'),
            layer: me.get('controllers.map').get('currentLayer')
          }).then(function() {
            me.onCreateTrailerEnd();
          });
        });
      } else if (command === "data.team.create") {
        this.command.send("map.draw.linestring", consts.style[consts.TEAM], function (feature) {
          me.onCreateTeamStart({
            feature: feature,
            map: me.get('map'),
            layer: me.get('controllers.map').get('currentLayer')
          });
          me.onCreateTeamEnd();
        });
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
    addTrail: function () {
      this.addTrail();
    },
    deleteTrail: function (trail) {
      this.deleteTrail(trail);
    },
    addItem: function () {
      this.addItem();
    },
    deleteItem: function (item) {
      this.deleteItem(item);
    },
    saveTrail: function (trail) {
      trail.save().then(function () {
        console.log(trail.get('name') + ".save :: success");
      }).catch(function (e) {
        console.log(trail.get('name') + ".save :: failure: " + e);
      });
    },
    exportTrail: function (format, trail) {
      this.exportTrail(format, trail);
    },
    triggerImport: function (target) {
      var me = this;
      var importFunc = this.mapImportTrailerFile;
      console.log('importing file: ' + target);
      if (target === 'map-data-import-team-input') {
        importFunc = this.mapImportTeamFile;
      }
      $('#' + target).on("change", function (evt) {
        importFunc.apply(me, [evt]);
      });
      $('#' + target).click();
    }
  }
});
