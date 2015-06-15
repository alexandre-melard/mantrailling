/**
 * Created by alex on 04/04/2015.
 */
import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";

export default Ember.Component.extend({
  classNames: ['btn-group'],
  followPathMode: false,
  followPathModeTitle: "Draw with straight lines",
  followPathModeIcon: "glyphicon glyphicon-plane",

  actions: {
    toggleAction: function () {
      this.toggleProperty('followPathMode');
      this.get('command').send("map.draw.linestring.mode", {followPathMode: this.get('followPathMode')});
      if (this.get('followPathMode')) {
        this.set('followPathModeTitle', "Follow the roads and path (click to switch to straight mode)");
        this.set('followPathModeIcon', "glyphicon glyphicon-road");
      } else {
        this.set('followPathModeTitle', "Draw with straight lines (click to switch to follow mode)");
        this.set('followPathModeIcon', "glyphicon glyphicon-plane");
      }
      // Fix tooltip
      $('.map-draw-follow-path').tooltip('hide')
        .attr('data-original-title', this.get('followPathModeTitle'))
        .tooltip('fixTitle')
        .tooltip('show');
    }
  }
});
