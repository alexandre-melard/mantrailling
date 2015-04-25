/**
 * Created by alex on 31/03/2015.
 */
import DS from 'ember-data';

export default DS.Model.extend({
  item: DS.belongsTo('mtgItem', {inverse: null}),
  point: DS.belongsTo('mtgPoint', {inverse: null})
});
