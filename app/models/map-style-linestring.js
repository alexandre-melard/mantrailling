import DS from 'ember-data';
import * as consts from '../utils/map-constants.js';

/**
 * Created by alex on 31/03/2015.
 */
export default DS.Model.extend({
  stroke: DS.belongsTo('mapStyleStoke'),
  text: DS.belongsTo('mapStyleText'),
  start: DS.belongsTo('mapStylePoint'),
  end: DS.belongsTo('mapStylePoint')
});
