/**
 * Created by alex on 31/03/2015.
 */
import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  identifier: DS.attr('string'),
  title: DS.attr('string'),
  abstract: DS.attr('string'),
  visible: DS.attr('boolean'),
  opacity: DS.attr(),
  layer: null,

  bindCommand: function () {
    var me = this;
    this.command.register(this, 'save', function (options) {
      return new Promise(function (resolve) {
        console.log("saving map layers");
        me.save();
        resolve(true);
      });
    });
  }.on('init'),

  pVisible: Ember.computed('visible', {
    get(key) {
      return this.get('visible');
    },
    set(key, value) {
      this.set('visible', value);
      this.get('layer').setVisible(value);
      this.save();
    }
  }),

  pOpacity: Ember.computed('opacity', {
    get(key) {
      return this.get('opacity');
    },
    set(key, value) {
      this.set('opacity', value / 100);
      this.get('layer').setOpacity(value / 100);
      this.save();
    }
  }),

});
