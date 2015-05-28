/**
 * Created by A140980 on 04/05/2015.
 */
import * as consts from '../utils/map-constants.js';
import calcBrightness from "../utils/color-get-brightness.js";
import getRGBColor from "../utils/color-get-rgb.js";

export default function (map, command) {
  var markerStyle = function (geometry, feature) {
    return [new ol.style.Style({
      image: new ol.style.Icon(({
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
    var label = feature.get('label');
    var style = feature.get('extensions');
    var color = feature.get('color');
    if (color !== undefined && color !== null) {
      style.fill.color.hexa = color;
      style.stroke.color.hexa = color;
      style.text.fill.color.hexa = color;
      style.text.stroke.color.hexa = color;
    }

    var fillColor = getRGBColor(style.fill.color.hexa);
    var strokeColor = getRGBColor(style.stroke.color.hexa);
    return [new ol.style.Style({
      image: new ol.style.Circle({
        radius: style.radius,
        fill: new ol.style.Fill({
          color: 'rgba(' + fillColor.r + ',' + fillColor.g + ',' + fillColor.b + ', '+
          parseFloat(style.fill.color.opacity) || 0.2 +')'
        }),
        stroke: new ol.style.Stroke({
          color: 'rgba(' + strokeColor.r + ',' + strokeColor.g + ',' + strokeColor.b + ', '+
          parseFloat(style.stroke.color.opacity) || 0.8 +')',
          width: parseInt(style.stroke.width) || 4
        })
      }),
      text: new ol.style.Text({
        offsetX: parseInt(style.text.offset.x) || 0,
        offsetY: parseInt(style.text.offset.y) || 0,
        font: style.text.font || '18px Calibri,sans-serif',
        text: label,
        fill: new ol.style.Fill({
          color: style.text.fill.color.hexa || '#000000'
        }),
        stroke: new ol.style.Stroke({
          color: (calcBrightness(getRGBColor(style.text.stroke.color.hexa || '#000000')) < 220) ? "#FFFFFF" : "#000000",
          width: parseInt(style.text.stroke.width) || 4
        })
      })
    })];
  };



  var polygonStyle = function (geometry, feature) {
    var label = feature.get('label');
    var style = feature.get('extensions');
    var color = feature.get('color');
    if (color !== undefined && color !== null) {
      style.fill.color.hexa = color;
      style.stroke.color.hexa = color;
      style.text.fill.color.hexa = color;
      style.text.stroke.color.hexa = color;
    }
    var fillColor = getRGBColor(style.fill.color.hexa);
    var strokeColor = getRGBColor(style.stroke.color.hexa);
    return [new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(' + fillColor.r + ',' + fillColor.g + ',' + fillColor.b + ', '+
        parseFloat(style.fill.color.opacity) || 0.2 +')'
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(' + strokeColor.r + ',' + strokeColor.g + ',' + strokeColor.b + ', '+
        parseFloat(style.stroke.color.opacity) || 0.8 +')',
        width: parseInt(style.stroke.width) || 4
      }),
      text: new ol.style.Text({
        offsetX: parseInt(style.text.offset.x) || 0,
        offsetY: parseInt(style.text.offset.y) || 0,
        font: style.text.font || '18px Calibri,sans-serif',
        text: label,
        fill: new ol.style.Fill({
          color: style.text.fill.color.hexa || '#000000'
        }),
        stroke: new ol.style.Stroke({
          color: (calcBrightness(getRGBColor(style.text.stroke.color.hexa || '#000000')) < 220) ? "#FFFFFF" : "#000000",
          width: parseInt(style.text.stroke.width) || 4
        })
      })
    })];
  };

  var lineStringStyle = function (geometry, feature) {
    // mise à jour de la longeur de piste dans le trail et de la position de piste dans le trail
    feature.on('change', function (e) {
      var feature = e.currentTarget;
      command.send('map.linestring.change', {feature: feature});
    }, this);
    var styles = [];
    var label = feature.get('label');
    var style = feature.get('extensions');
    var color = feature.get('color');
    if (color !== undefined && color !== null) {
      style.stroke.color.hexa = color;
      style.text.fill.color.hexa = color;
      style.text.stroke.color.hexa = color;
    }

    var strokeColor = style.stroke.color.hexa || '#000000';
    var strokeRGB = getRGBColor(strokeColor);
    styles.push(new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'rgba(' + strokeRGB.r + ',' +
        strokeRGB.g + ',' +
        strokeRGB.b + ', ' +
        style.stroke.color.opacity || '0.8' + ')',
        width: parseInt(style.stroke.width) || 10
      }),
      text: new ol.style.Text({
        offsetX: parseInt(style.text.offset.x) || 0,
        offsetY: parseInt(style.text.offset.y) || 0,
        font: style.text.font || '18px Calibri,sans-serif',
        text: label,
        fill: new ol.style.Fill({
          color: style.text.fill.color.hexa || '#000000'
        }),
        stroke: new ol.style.Stroke({
          color: (calcBrightness(getRGBColor(style.text.stroke.color.hexa || '#000000')) < 220) ? "#FFFFFF" : "#000000",
          width: parseInt(style.text.stroke.width) || 4
        })
      })
    }));
    if (style.start !== undefined || style.end !== undefined) {
      geometry.forEachSegment(function (start, end) {
        var startLine = geometry.getFirstCoordinate();
        var endLine = geometry.getLastCoordinate();
        var rgb;
        if (style.start !== undefined) {
          if (start[0] === startLine[0] && start[1] === startLine[1]) {
            rgb = getRGBColor(style.start.color);
            styles.push(new ol.style.Style({
              geometry: new ol.geom.Point(start),
              image: new ol.style.Circle({
                radius: parseInt(style.start.radius),
                fill: new ol.style.Fill({
                  color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', ' + style.start.opacity + ')'
                }),
                stroke: new ol.style.Stroke({
                  color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.8)',
                  width: parseInt(style.start.stroke.width) || 4
                })
              })
            }));
          }
        }
        if (style.end !== undefined) {
          if (end[0] === endLine[0] && end[1] === endLine[1]) {
            rgb = getRGBColor(style.end.color);
            styles.push(new ol.style.Style({
              geometry: new ol.geom.Point(end),
              image: new ol.style.Circle({
                radius: parseInt(style.end.radius),
                fill: new ol.style.Fill({
                  color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', ' + style.end.opacity + ')'
                }),
                stroke: new ol.style.Stroke({
                  color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.8)',
                  width: parseInt(style.end.stroke.width) || 4
                })
              })
            }));
          }
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
