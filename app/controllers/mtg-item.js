/**
 * Created by alex on 22/04/2015.
 */
import Ember from 'ember';
import consts from '../utils/map-constants';

export default Ember.Controller.extend({
  needs: ["mtgTrail"],
  mtgTrail: Ember.computed.alias("controllers.mtgTrail"),
  selectedTrail: Ember.computed.alias("controllers.mtgTrail.selectedTrail"),
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
    item.get('location').removeFromMap(this.get('mtgTrail').get('layer'));
    item.get('location').deleteRecord();
    this.get('mtgTrail').get('selectedTrail').get('items').removeObject(item);
    item.deleteRecord();
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
          var mapPoint = item.get('location');
          if (mapPoint === null) {
            mapPoint = me.store.createRecord('mapPoint');
            item.set('location', mapPoint);
          }
          mapPoint.set('feature', feature);
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
