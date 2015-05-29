import DS from 'ember-data';
import * as consts from '../utils/map-constants.js';

/**
 * Created by alex on 31/03/2015.
 */
export default DS.Model.extend({
  hexa: DS.attr('string'),
  opacity: DS.attr('string')
});
