/**
 * Created by A140980 on 15/06/2015.
 */
import calcBrightness from "../utils/color-get-brightness";
import getRGBColor from "../utils/color-get-rgb";
import t from "../utils/i18n-utils";

export default function (command, i18n, geometry, feature) {
  var styles = [];
  var label = feature.get('label');
  var style = feature.get('extensions');
  var color = feature.get('color');
  if (!Ember.isEmpty(color)) {
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
  var getLineStringExtremityStyle = function (pos, style) {
    var rgb = getRGBColor(style.color);
    var text = null;
    if (!Ember.isEmpty(style.text)) {
      text = new ol.style.Text({
        offsetX: parseInt(style.text.offset.x) || 0,
        offsetY: parseInt(style.text.offset.y) || 0,
        font: style.text.font || '18px Calibri,sans-serif',
        text: t(i18n, style.label),
        fill: new ol.style.Fill({
          color: style.text.fill.color.hexa || '#000000'
        }),
        stroke: new ol.style.Stroke({
          color: (calcBrightness(getRGBColor(style.text.stroke.color.hexa || '#000000')) < 220) ? "#FFFFFF" : "#000000",
          width: parseInt(style.text.stroke.width) || 4
        })
      });
    }
    styles.push(new ol.style.Style({
      geometry: new ol.geom.Point(pos),
      text: text,
      image: new ol.style.Circle({
        radius: parseInt(style.radius),
        fill: new ol.style.Fill({
          color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', ' + style.opacity + ')'
        }),
        stroke: new ol.style.Stroke({
          color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.8)',
          width: parseInt(style.stroke.width) || 4
        })
      })
    }));
  };
  if (!Ember.isEmpty(style.start) || !Ember.isEmpty(style.end)) {
    geometry.forEachSegment(function (start, end) {
      var startLine = geometry.getFirstCoordinate();
      var endLine = geometry.getLastCoordinate();
      if (!Ember.isEmpty(style.start)) {
        if (start[0] === startLine[0] && start[1] === startLine[1]) {
          getLineStringExtremityStyle(start, style.start);
        }
      }
      if (!Ember.isEmpty(style.end)) {
        if (end[0] === endLine[0] && end[1] === endLine[1]) {
          getLineStringExtremityStyle(end, style.end);
        }
      }
    });
  }
  return styles;
}
