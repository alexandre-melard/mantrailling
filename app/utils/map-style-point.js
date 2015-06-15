/**
 * Created by A140980 on 15/06/2015.
 */
import calcBrightness from "../utils/color-get-brightness";
import getRGBColor from "../utils/color-get-rgb";

export default function (geometry, feature) {
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
        color: 'rgba(' + fillColor.r + ',' + fillColor.g + ',' + fillColor.b + ', ' +
        parseFloat(style.fill.color.opacity) || 0.2 + ')'
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(' + strokeColor.r + ',' + strokeColor.g + ',' + strokeColor.b + ', ' +
        parseFloat(style.stroke.color.opacity) || 0.8 + ')',
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
}
