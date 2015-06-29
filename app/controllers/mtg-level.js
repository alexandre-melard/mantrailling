/**
 * Created by alex on 04/04/2015.
 */
import Ember from 'ember';
import * as consts from '../utils/map-constants';
import { translationMacro as t } from "ember-i18n";

export default Ember.Controller.extend({
  needs: ["mtgTrail"],
  mtgLevel: Ember.computed.alias("controllers.mtgLevel"),
  selectedTrail: Ember.computed.alias("controllers.mtgTrail.selectedTrail"),
  addLevelName: "",
  tBrevet: t("map.menu.mtg.trail.levels.level.basic"),
  tLevel1: t("map.menu.mtg.trail.levels.level.intermediate"),
  tLevel2: t("map.menu.mtg.trail.levels.level.advanced"),
  tLevel3: t("map.menu.mtg.trail.levels.level.master"),
  levels: [],

  bindCommand: function () {
    var me = this;
    this.command.register(this, 'mtg.levels.create', this.createLevel);
  }.on('init'),

  createLevel: function (options) {
    var me = this;
    return new Promise(function (resolve) {
      var level = me.store.createRecord('mtgLevel', {
        name: options.name,
        index: options.index
      });
      me.levels.pushObject(level);
      resolve(level);
    });
  },

  /**
   * Return the selected Level in Levels' array.
   * If level param is set, set levels to unselected and provided level to selected.
   * @param level
   * @param context
   * @returns {*}
   */
  //selectedLevel: Ember.computed('levels.@each.selected', {
  //  get: function () {
  //    if (this.get('levels').length === 0) {
  //      console.log("no level has been defined yet, please create a level first");
  //      return false;
  //    }
  //    return this.get('levels').findBy('selected', true);
  //  },
  //  set: function (key, value) {
  //    var me = this;
  //    if (this.get('levels').length === 0) {
  //      console.log("no level has been defined yet, please create a level first");
  //      return false;
  //    }
  //    this.get('levels').forEach(function (t) {
  //      if (t === value) {
  //        t.set('selected', true);
  //        me.get('selectedTrail').set('level', t);
  //      } else {
  //        t.set('selected', false);
  //      }
  //    }, this);
  //  }
  //}),
  selectedLevel: function (key, value, previousValue) {
    var me = this;
    if (this.get('levels').length === 0) {
      console.log("no level has been defined yet, please create a level first");
      return false;
    }
    if (arguments.length <= 1) {
      value = this.get('levels').findBy('selected', true);
    } else {
      this.get('levels').forEach(function (t) {
        if (t === value) {
          t.set('selected', true);
        } else {
          t.set('selected', false);
        }
      }, this);
    }
    return value;
  }.property('levels.@each.selected'),

  onSelectLevel: function () {
    var selectedTrail = this.get('selectedTrail');
    if (Ember.isEmpty(selectedTrail)) {
      return;
    }
    selectedTrail.set('level', this.get('selectedLevel'));
  }.observes('selectedLevel'),

  onSelectTrail: function () {
    var selectedTrail = this.get('selectedTrail');
    if (Ember.isEmpty(selectedTrail)) {
      return;
    }
    if (!Ember.isEmpty(selectedTrail.get('level'))) {
      this.set('selectedLevel', selectedTrail.get('level'));
    } else {
      selectedTrail.set('level', this.get('levels').objectAt(0));
    }
  }.observes('selectedTrail'),

  loadLevels: function () {
    var me = this;
    this.store.find('mtgLevel').then(function (storedLevels) {
      if (storedLevels.get('length') === 0) {
        var brevet = me.store.createRecord('mtgLevel', {name: me.get("tBrevet"), index: 0, selected: true});
        var lvl1 = me.store.createRecord('mtgLevel', {name: me.get("tLevel1"), index: 1, selected: false});
        var lvl2 = me.store.createRecord('mtgLevel', {name: me.get("tLevel2"), index: 2, selected: false});
        var lvl3 = me.store.createRecord('mtgLevel', {name: me.get("tLevel3"), index: 3, selected: false});
        Promise.all([
          brevet.save(),
          lvl1.save(),
          lvl2.save(),
          lvl3.save()
        ]).then(function () {
          me.get('levels').pushObject(brevet);
          me.get('levels').pushObject(lvl1);
          me.get('levels').pushObject(lvl2);
          me.get('levels').pushObject(lvl3);
        });
      } else {
        me.set('levels', storedLevels.sortBy('index'));
      }
    });
  },

  actions: {
    changeLevel: function (level) {
      this.set('selectedLevel', level);
    },
    addLevel: function () {
      this.createLevel({
        name: this.get('addLevelName'),
        index: this.levels.get('length')
      }).then(function (level) {
        this.set('selectedLevel', level);
      });
    },
    deleteLevel: function (level) {
      console.log("level deleted: " + level.get('name'));
      this.get('levels').removeObject(level);
      this.set('selectedLevel', this.get('levels').get('firstObject'));
      level.deleteRecord();
    }
  }
});
