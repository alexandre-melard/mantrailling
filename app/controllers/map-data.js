/**
 * Created by alex on 04/04/2015.
 */
import Ember from 'ember';

// Formats
var GEO_JSON = "GeoJSON";
var KML = "KML";
var GPX = "GPX";
var BREVET = "Basic";
var LVL1 = "Intermediate";
var LVL2 = "Advanced";
var LVL3 = "Master";

export default Ember.Controller.extend({

  needs: ['map', 'mapDraw'],
  draw: Ember.computed.alias("controllers.mapDraw"),
  map: null,
  addTrailName: null,
  trails: [],
  formats: [GEO_JSON, KML, GPX],
  selectedFormat: GEO_JSON,
  levels: [BREVET, LVL1, LVL2, LVL3],
  itemTypes: ['Cloth', 'Leather', 'Cardboard', 'Plastic'],
  currentItem: {},
  items: [],

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
      // at time of creation there is an error in the GPX format (18.7.2014)
      console.log(e.name + ": " + e.message);
      return;
    }
    return data;
  },

  addTrail: function () {
    var trail = this.store.createRecord('mtgTrail', {
      name: this.get('addTrailName')
    });
    trail.save().then(function () {
      console.log(model + ".save :: success");
    }).catch(function (e) {
      console.log(model + ".save :: failure: " + e);
    });
    this.trails.pushObject(trail);
    trail.set('selected', true);
    trail = this.changeActiveTrail(trail);
    return trail;
  },

  exportTrail: function (trail, format) {
    var layer = trail.layer;
    var data = this.getData(format, layer);
    var a = document.createElement("a");
    a.href = window.URL.createObjectURL(new Blob([data], {type: 'application/mantralling'}));
    a.download = trail.name + '.' + format.toLowerCase();
    a.click();
  },

  loadTrails: function () {
    var me = this;
    var mapController = this.get('controllers.map');
    var trails = this.trails;
    var changeActiveTrail = this.changeActiveTrail;
    var storedTrails = this.store.find('mtgTrail');
    storedTrails.then(function (storedTrails) {
      storedTrails.forEach(function (trail) {
        var features = JSON.parse(trail.get('features'));
        var vectorSource = mapController.createVectorSource(features);
        var vectorLayer = mapController.createVector(vectorSource);
        vectorLayer.setStyle(mapController.getDefaultStyle());
        trail.set('layer', vectorLayer);
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
    trail.set('selected', true);
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
      mapCtrl.set('currentLayer', this.trails.get('lastObject').get('layer'));
    } else {
      // if no layers yet, create a new one :)
      mapCtrl.changeCurrentLayer(null);
    }
    this.get('controllers.map').addObserver('map', this, function (sender) {
      this.set('map', sender.get('map'));
    });
  },

  addItem: function () {
    var items = this.get('selectedTrail').get('items');
    this.get('currentItem').index = (items.get('length') + 1);
    var mtgItem = this.store.createRecord('mtgItem', this.get('currentItem'));
    mtgItem.save();
    this.get('selectedTrail').get('items').pushObject(mtgItem);
    console.log('new item created ' + mtgItem.get('index'));
    this.set('currentItem', {});
  },

  deleteItem: function (item) {
    item.destroyRecord();
    this.get('selectedTrail').get('itemAtPoints').removeObject(item);
  },

  actions: {
    changeTrack: function (trail) {
      this.changeActiveTrail(trail);
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
      trail.save();
    },
    exportTrail: function (format, trail) {
      this.exportTrail(format, trail);
    }
  }
});
