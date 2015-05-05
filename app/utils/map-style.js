/**
 * Created by A140980 on 04/05/2015.
 */
import * as consts from '../utils/map-constants.js';
import formatLength from "../utils/map-format-length.js";
import formatArea from "../utils/map-format-area.js";
import calcBrightness from "../utils/color-get-brightness.js";
import getRGBColor from "../utils/color-get-rgb.js";

export default function (map) {
  var getColor = function (def, feature) {
    var color = feature.get("color");
    if (color === undefined || color === null) {
      color = def;
    }
    return color;
  };
  var markerStyle = function (geometry, feature) {
    return [new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        anchor: [0.5, 32],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        opacity: 1,
        src: "assets/images/Marker-Outside-Pink.png"
      }))
    })
    ];
  };

  var pointStyle = function (geometry, feature) {
    var type = feature.get('specificType');
    if (type === consts.MARKER) {
      return markerStyle(geometry, feature);
    } else {
      var radius = feature.get('radius') || 10;
      console.log('using radius:' + radius);
      var opacity = parseFloat(feature.get('opacity')) || 0.5;
      console.log('using opacity:' + opacity);
      var label = feature.get('label') || "";
      console.log('using label:' + label);
      var rgb = getRGBColor(getColor('#ac2925', feature));
      return [new ol.style.Style({
        image: new ol.style.Circle({
          radius: radius,
          fill: new ol.style.Fill({
            color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', ' + opacity + ')'
          }),
          stroke: new ol.style.Stroke({
            color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.8)',
            width: 2
          })
        }),
        text: new ol.style.Text({
          //offsetX: -radius,
          font: '18px Calibri,sans-serif',
          text: label,
          fill: new ol.style.Fill({
            color: getColor('#286090', feature)
          }),
          stroke: new ol.style.Stroke({
            color: (calcBrightness(rgb) < 220) ? "#FFFFFF" : "#000000",
            width: 3
          })
        })
      })
      ];
    }
  };

  var polygonStyle = function (geometry, feature) {
    var label = formatArea(map.getView().getProjection(), feature.getGeometry());
    var color = getColor('#204d74', feature);
    var rgb = getRGBColor(color);
    return [new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.2)'
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.8)'
      }),
      text: new ol.style.Text({
        offsetY: -10,
        font: '18px Calibri,sans-serif',
        text: label,
        fill: new ol.style.Fill({
          color: getColor('#286090', feature)
        }),
        stroke: new ol.style.Stroke({
          color: (calcBrightness(rgb) < 220) ? "#FFFFFF" : "#000000",
          width: 3
        })
      })
    })];
  };

  var lineStringStyle = function (geometry, feature) {
    if (geometry.getType() === consts.MULTILINE_STRING) {
      // get the first path of the file
      geometry = geometry.getLineStrings()[0];
    }
    var label = formatLength(map.getView().getProjection(), geometry);
    var type = feature.get('specificType');
    var styles = [];
    var color, rgb;
    if (type === consts.TEAM) {
      color = getColor('#ec971f', feature);
      rgb = getRGBColor(color);
      styles.push(new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.8)',
          width: 2
        }),
        text: new ol.style.Text({
          offsetY: -10,
          font: '18px Calibri,sans-serif',
          text: label,
          fill: new ol.style.Fill({
            color: getColor('#ec971f', feature)
          }),
          stroke: new ol.style.Stroke({
            color: (calcBrightness(rgb) < 220) ? "#FFFFFF" : "#000000",
            width: 3
          })
        })
      }));
    } else {
      color = getColor('#449d44', feature);
      rgb = getRGBColor(color);
      styles.push(new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.8)',
          width: 4
        }),
        text: new ol.style.Text({
          offsetY: 10,
          font: '18px Calibri,sans-serif',
          text: label,
          fill: new ol.style.Fill({
            color: getColor('#449d44', feature)
          }),
          stroke: new ol.style.Stroke({
            color: (calcBrightness(rgb) < 220) ? "#FFFFFF" : "#000000",
            width: 3
          })
        })
      }));
    }
    if (type === consts.TRAILER) {
      geometry.forEachSegment(function (start, end) {
        var startLine = geometry.getFirstCoordinate();
        var endLine = geometry.getLastCoordinate();
        var rgb;
        if (start[0] === startLine[0] && start[1] === startLine[1]) {
          rgb = getRGBColor('#008000');
          styles.push(new ol.style.Style({
            geometry: new ol.geom.Point(start),
            image: new ol.style.Circle({
              radius: 10,
              fill: new ol.style.Fill({
                color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.2)'
              }),
              stroke: new ol.style.Stroke({
                color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.8)'
              })
            })
          }));
        }
        if (end[0] === endLine[0] && end[1] === endLine[1]) {
          rgb = getRGBColor('#FF0000');
          styles.push(new ol.style.Style({
            geometry: new ol.geom.Point(end),
            image: new ol.style.Circle({
              radius: 10,
              fill: new ol.style.Fill({
                color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.2)'
              }),
              stroke: new ol.style.Stroke({
                color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.8)'
              })
            })
          }));
        }
      });
    }
    return styles;
  };
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
      style = lineStringStyle(geometry, feature);
    } else if (geometry.getType() === consts.MARKER) {
      style = markerStyle(geometry, feature);
    }
    return style;
  };
}
