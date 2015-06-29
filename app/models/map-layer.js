/**
 * Created by alex on 31/03/2015.
 */
import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  identifier: DS.attr('string'),
  title: DS.attr('string'),
  abstract: DS.attr('string'),
  _visible: DS.attr('boolean'),
  _opacity: DS.attr('number'),
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

  visible: Ember.computed('visible', {
    get(key) {
      return this.get('_visible');
    },
    set(key, value) {
      this.set('_visible', value);
      if (!Ember.isEmpty(this.get('layer'))) {
        this.get('layer').setVisible(value);
      }
      this.save();
    }
  }),

  opacity: Ember.computed('opacity', {
    get() {
      return this.get('_opacity');
    },
    set(key, value) {
      this.set('_opacity', value);
      if (!Ember.isEmpty(this.get('layer'))) {
        this.get('layer').setOpacity(value);
      }
      this.save();
    }
  })

});
