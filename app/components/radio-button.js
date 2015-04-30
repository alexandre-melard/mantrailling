import Ember from 'ember';

//import EmberRadioButton from 'ember-radio-buttons';
//export default EmberRadioButton.extend({
//  didInsertElement: function() {
//    this.$("input[type='radio']").on("click", function() {
//      $(this).addClass("active");
//    });
//  }.on("didInsertElement")
//});


export default Ember.Component.extend({
  tagName: 'input',
  type: 'radio',
  attributeBindings: [ 'checked', 'name', 'type', 'value', 'groupValue' ],

  init: function() {
    this._super();
    this.checked();
  },

  checked: function () {
    if (this.get('value') === this.get('groupValue')) {
      Ember.run.once(this, 'takeAction');
      return true;
    } else { return false; }
  },

  takeAction: function() {
    this.$().closest(".btn-group").find("label").removeClass("active");
    this.$().parent().addClass("active");
    this.sendAction('selectedAction', this.get('value'));
  },

  change: function () {
    this.set('groupValue', this.get('value'));
    Ember.run.once(this, 'checked'); //manual observer
  }
});

