import DS from 'ember-data';
import * as consts from '../utils/map-constants';

/**
 * Created by alex on 31/03/2015.
 */
export default DS.Model.extend({
  color: DS.belongsTo('mapStyleColor'),
  width: DS.attr('number'),
});
