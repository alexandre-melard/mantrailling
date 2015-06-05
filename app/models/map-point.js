/**
 * Created by alex on 31/03/2015.
 */
import DS from 'ember-data';
import GeoJSON from '../models/geo-json';

export default GeoJSON.extend({
  mapDraw: DS.belongsTo('mapDraw')
});
