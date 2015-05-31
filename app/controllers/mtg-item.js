/**
 * Created by alex on 22/04/2015.
 */
import Ember from 'ember';
import consts from '../utils/map-constants.js';

export default Ember.Controller.extend({
  needs: ["mtgTrail"],
  mtgTrail: Ember.computed.alias("controllers.mtgTrail"),
  itemTypes: ['Cloth', 'Leather', 'Cardboard', 'Plastic'],
  currentItem: {position: 'P', type: 'Cloth', description: null},
  items: [],

  addItem: function () {
    var items = this.get('mtgTrail').get('selectedTrail').get('items');
    this.get('currentItem').index = (items.get('length') + 1);
    var mtgItem = this.store.createRecord('mtgItem', this.get('currentItem'));
    this.get('mtgTrail').get('selectedTrail').get('items').pushObject(mtgItem);
    console.log('new item created ' + mtgItem.get('index'));
    this.set('currentItem', {position: 'P', type: '', description: null});
  },

  deleteItem: function (item) {
    item.deleteRecord();
    this.get('mtgTrail').get('selectedTrail').get('itemAtPoints').removeObject(item);
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
          feature.set('label', item.get('index') + item.get('position'));
          item.set("feature", feature);
          me.command.send('map.draw.point.create', {feature: feature});
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
