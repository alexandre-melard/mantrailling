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
   * If trial param is set, set trails to unselected and provided trail to selected.
   * @param trail
   * @param context
   * @returns {*}
   */
  selectedTrail: function(key, value, previousValue) {
    if (this.get('trails').length === 0) {
      console.log("no trail has been defined yet, please create a trail first");
      return false;
    }
    if (arguments.length <= 1) {
      return this.get('trails').findBy('selected', true);
    } else {
      this.get('trails').forEach(function (t) {
        if (t === value) {
          t.set('selected', true);
        } else {
          t.set('selected', false);
        }
        t.save();
      }, this);
      return value;
    }
  }.property('trails.@each.selected'),


  create: function (store, model, values) {
    var record = store.createRecord(model, values);
    record.save().then(function () {
      console.log(model + ".save :: success");
    }).catch(function (e) {
      console.log(model + ".save :: failure: " + e);
    });
    return record;
  },
  createOrUpdate: function (store, model, select, values) {
    var record = null;
    var records = store.find(model, select);
    return records
      .then(function (records) {
        var record = records.get("firstObject");
        $.each(values, function (key, value) {
          record.set(key, value);
        });
        record.save().then(function () {
          console.log(model + ".save :: success");
        }).catch(function (e) {
          console.log(model + ".save :: failure: " + e);
        });
        return record;
      })
      .catch(function () {
        record = store.createRecord(model, values);
        record.save().then(function () {
          console.log(model + ".save :: success");
        }).catch(function (e) {
          console.log(model + ".save :: failure: " + e);
        });
        return record;
      });
  },

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
    var trail = this.create(
      this.store, 'mtgTrail',
      {
        name: this.addTrailName,
        selected: true
      });
    this.trails.pushObject(trail);
    trail = this.changeActiveTrail(trail);
    return trail;
  },

  saveTrail: function (trail) {
    var layer = trail.layer;
    var me = this;
    var createOrUpdate = this.createOrUpdate;
    var store = this.store;
    var data = this.getData(this.selectedFormat, layer);
    var trails = this.trails;
    var mtgPoint = createOrUpdate(store, 'mtgPoint',
      {long: "0", lat: "0"},
      {long: "42", lat: "3"});
    mtgPoint.then(function (mtgPoint) {
      var mtgItem = createOrUpdate(store, 'mtgItem',
        {
          name: "chaussette",
          material: "tissu"
        },
        {
          name: "chaussette",
          material: "tissu",
          description: "carré de tissus de la taille d'un mouchoir"
        }
      );
      mtgItem.then(function (mtgItem) {
        var mtgItemAtPoint = createOrUpdate(store, 'mtgItemAtPoint',
          {item: mtgItem, position: mtgPoint},
          {item: mtgItem, position: mtgPoint});
        mtgItemAtPoint.then(function (mtgItemAtPoint) {
          var select;
          if (trail.id !== undefined && trail.id !== null) {
            select = {id: trail.id};
          } else {
            select = {name: trail.get("name")};
          }
          var mtgTrail = createOrUpdate(store, 'mtgTrail',
            select,
            {
              name: trail.get("name"),
              address: 'route du soleil 34555 tes',
              date: '2015-02-11',
              level: 'motivation 1 aveugle',
              features: data
            });
          mtgTrail.then(function (mtgTrail) {
            mtgTrail.get("itemAtPoints").pushObject(mtgItemAtPoint);
            mtgTrail.save().then(function () {
              console.log("mtgTrail.save :: success");
              if (!trails.contains(mtgTrail)) {
                trails.pushObject(mtgTrail);
                me.changeActiveTrail(mtgTrail, me);
              }
            }).catch(function (e) {
                console.log("mtgTrail.save :: failure: " + e);
            });
          });
        });
      });
    });
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

  addItem: function() {
    var itemAtPoints = this.get('selectedTrail').get('itemAtPoints');
    this.get('currentItem').index = (itemAtPoints.get('length') + 1);
    var mtgItem = this.store.createRecord('mtgItem', this.get('currentItem'));
    mtgItem.save();
    var mtgItemAtPoint = this.store.createRecord('mtgItemAtPoint', {item: mtgItem});
    mtgItemAtPoint.save();
    this.get('selectedTrail').get('itemAtPoints').pushObject(mtgItemAtPoint);
    console.log('new item created ' + mtgItem.get('index'));
    this.set('currentItem', {});
  },

  deleteItem: function(item) {
    item.destroyRecord();
    this.get('selectedTrail').get('itemAtPoints').removeObject(item);
  },

  actions: {
    positionItem: function(item) {
      var color = this.get('draw').get('color');
      console.log('current color: ' + color);
      $('.color-picker[title="#ffffff"]').click();
      $('.map-draw-point').click();
      if (color !== undefined) {
        this.get('draw').set('color', color);
      }

    },
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
      this.saveTrail(trail);
    },
    exportTrail: function (format, trail) {
      this.exportTrail(format, trail);
    }
  }
});
