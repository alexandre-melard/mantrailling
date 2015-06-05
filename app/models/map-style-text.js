import DS from 'ember-data';
import * as consts from '../utils/map-constants';

/**
 * Created by alex on 31/03/2015.
 */
export default DS.Model.extend({
  offset: DS.belongsTo('mapStyleOffset'),
  font: DS.attr('string'),
  fill: DS.belongsTo('mapStyleFill'),
  stroke: DS.belongsTo('mapStyleStoke')
});
