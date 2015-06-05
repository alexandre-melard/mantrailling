import DS from 'ember-data';
import * as consts from '../utils/map-constants';

/**
 * Created by alex on 31/03/2015.
 */
let Style = DS.Model.extend({
  LineString: DS.belongsTo('mapStyleLinestring'),
  Trailer: DS.belongsTo('mapStyleLinestring'),
  Team: DS.belongsTo('mapStyleLinestring'),
  Polygon: DS.belongsTo('mapStylePolygon'),
  Point: DS.belongsTo('mapStylePoint')
});

export default Style;


