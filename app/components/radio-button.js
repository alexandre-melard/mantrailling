import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'input',
  type: 'radio',
  attributeBindings: [ 'checked', 'name', 'type', 'value', 'groupValue' ],

  handleCheckedInit: function() {
    this.checked();
  }.on('didInsertElement'),

  checked: function () {
    if (this.get('value') === this.get('groupValue')) {
      this.takeAction();
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

