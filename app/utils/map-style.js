/**
 * Created by A140980 on 04/05/2015.
 */
import * as consts from '../utils/map-constants';
import lineStringStyle from "../utils/map-style-linestring";
import polygonStyle from "../utils/map-style-polygon";
import pointStyle from "../utils/map-style-point";

export default function (command, i18n) {
  return function (feature) {
    if (!(feature instanceof ol.Feature)) {
      feature = this;
    }
    var style = null;
    var geometry = feature.getGeometry();
    if (geometry.getType() === consts.POINT) {
      style = pointStyle(geometry, feature);
    } else if (geometry.getType() === consts.POLYGON) {
      style = polygonStyle(geometry, feature);
    } else if (geometry.getType() === consts.LINE_STRING || geometry.getType() === consts.MULTILINE_STRING) {
      style = lineStringStyle(command, i18n, geometry, feature);
    }
    return style;
  };
}
