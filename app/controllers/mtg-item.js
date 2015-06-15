/**
 * Created by alex on 22/04/2015.
 */
import Ember from 'ember';
import consts from '../utils/map-constants';
import { translationMacro as t } from "ember-i18n";

export default Ember.Controller.extend({
  needs: ["mtgTrail"],
  mtgTrail: Ember.computed.alias("controllers.mtgTrail"),
  items: Ember.computed.alias("controllers.mtgTrail.selectedTrail.items"),

  itemTypes: [],
  currentItem: null,

  tGround: t("map.menu.mtg.trail.items.item.ground"),
  tCloth: t("map.menu.mtg.trail.items.item.cloth"),
  tLeather: t("map.menu.mtg.trail.items.item.leather"),
  tCardboard: t("map.menu.mtg.trail.items.item.cardboard"),
  tPlastic: t("map.menu.mtg.trail.items.item.plastic"),
  tWood: t("map.menu.mtg.trail.items.item.wood"),

  loadItems: function() {
    var types = this.get('itemTypes');
    types.pushObject(this.get('tCloth'));
    types.pushObject(this.get('tLeather'));
    types.pushObject(this.get('tCardboard'));
    types.pushObject(this.get('tPlastic'));
    types.pushObject(this.get('tWood'));
    this.set('currentItem', {position: this.get('tGround'), type: this.get("tCloth"), description: null});
  }.on('init'),

  addItem: function () {
    var items = this.get('items');
    this.get('currentItem').index = (items.get('length') + 1);
    var mtgItem = this.store.createRecord('mtgItem', this.get('currentItem'));
    this.get('items').pushObject(mtgItem);
    console.log('new item created ' + mtgItem.get('index'));
    this.set('currentItem', {position: this.get('tGround'), type: this.get("tCloth"), description: null});
  },

  deleteItem: function (itemToDel) {
    this.get('items').forEach(function(currentItem) {
      var indexToDel = itemToDel.get('index');
      var currentIndex = currentItem.get("index");
      if (currentIndex > indexToDel) {
        currentItem.set("index", (currentIndex - 1));
        var mapPoint = currentItem.get('location');
        if (mapPoint !== null) {
          mapPoint.set('label', currentItem.get('index') + currentItem.get('position'));
        }
      }
    });
    var mapPoint = itemToDel.get('location');
    if (mapPoint !== null) {
      mapPoint.removeFromMap(this.get('mtgTrail').get('layer'));
      mapPoint.deleteRecord();
    }
    this.get('items').removeObject(itemToDel);
    itemToDel.deleteRecord();
  },

  actions: {
    positionItem: function (item) {
      var me = this;
      var options = {
        style: consts.style[consts.ITEM],
        removeFeature: item.get("feature")
      };
      this.command.send('map.draw.point', options,
        function (feature) {
          var mapPoint = item.get('location');
          if (mapPoint === null) {
            mapPoint = me.store.createRecord('mapPoint');
            item.set('location', mapPoint);
          }
          mapPoint.set('feature', feature);
          mapPoint.set('label', item.get('index') + item.get('position'));
          mapPoint.exportGeoJSON();
        },
        function (reason) {
          console.log('could not create item icon: ' + reason);
        });
    },
    addItem: function () {
      this.addItem();
    },
    deleteItem: function (item) {
      this.deleteItem(item);
    }
  }
});
