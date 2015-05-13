/**
 * Created by A140980 on 04/05/2015.
 */
import * as consts from '../utils/map-constants.js';
import formatLength from "../utils/map-format-length.js";
import formatArea from "../utils/map-format-area.js";
import calcBrightness from "../utils/color-get-brightness.js";
import getRGBColor from "../utils/color-get-rgb.js";
import mapFormatDMS from "../utils/map-format-dms.js";

export default function (map, command) {
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
      var radius = feature.get('radius') || consts.style.point.radius;
      var opacity = parseFloat(feature.get('opacity')) ||  consts.style.point.opacity;
      var label = feature.get('label') ||  consts.style.point.label;
      var color = getColor(consts.style.point.color, feature);
      var rgb = getRGBColor(color);
      return [new ol.style.Style({
        image: new ol.style.Circle({
          radius: radius,
          fill: new ol.style.Fill({
            color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', ' + opacity + ')'
          }),
          stroke: new ol.style.Stroke({
            color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.8)',
            width: consts.style.point.stroke.width
          })
        }),
        text: new ol.style.Text({
          font: consts.style.text.font,
          text: label,
          fill: new ol.style.Fill({
            color: color
          }),
          stroke: new ol.style.Stroke({
            color: (calcBrightness(rgb) < 220) ? "#FFFFFF" : "#000000",
            width: consts.style.text.stroke.width
          })
        })
      })
      ];
    }
  };

  var polygonStyle = function (geometry, feature) {
    var label = formatArea(map.getView().getProjection(), feature.getGeometry());
    var color = getColor(consts.style.zone.color, feature);
    var rgb = getRGBColor(color);
    return [new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.2)'
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.8)',
        width: consts.style.zone.stroke.width
      }),
      text: new ol.style.Text({
        offsetY: -10,
        font: consts.style.text.font,
        text: label,
        fill: new ol.style.Fill({
          color: color
        }),
        stroke: new ol.style.Stroke({
          color: (calcBrightness(rgb) < 220) ? "#FFFFFF" : "#000000",
          width: consts.style.text.stroke.width
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
      color = getColor(consts.style.team.color, feature);
      rgb = getRGBColor(color);
      styles.push(new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.8)',
          width: consts.style.team.stroke.width
        }),
        text: new ol.style.Text({
          offsetY: -10,
          font: consts.style.text.font,
          text: label,
          fill: new ol.style.Fill({
            color: getColor(consts.style.team.color, feature)
          }),
          stroke: new ol.style.Stroke({
            color: (calcBrightness(rgb) < 220) ? "#FFFFFF" : "#000000",
            width: consts.style.text.stroke.width
          })
        })
      }));
    } else {
      // mise à jour de la longeur de piste dans le trail et de la position de piste dans le trail
      var updateLengthAndLocation = function(map, feature, command) {
        var options = {
          length: formatLength(map.getView().getProjection(), geometry)
        };
        command.send('map.info.length', options);
        var coords = ol.proj.transform(geometry.getFirstCoordinate(), "EPSG:3857", "EPSG:4326");
        options = {
          location: mapFormatDMS(coords[1], coords[0])
        };
        command.send('map.info.location', options);
      };
      feature.on('change', function(e) {
        var feature = e.currentTarget;
        updateLengthAndLocation(map, feature, command);
      }, this);
      updateLengthAndLocation(map, feature, command);


      color = getColor(consts.style.trailer.color, feature);
      rgb = getRGBColor(color);
      styles.push(new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.8)',
          width: 4
        }),
        text: new ol.style.Text({
          offsetY: 10,
          font: consts.style.text.font,
          text: label,
          fill: new ol.style.Fill({
            color: getColor(consts.style.trailer.color, feature)
          }),
          stroke: new ol.style.Stroke({
            color: (calcBrightness(rgb) < 220) ? "#FFFFFF" : "#000000",
            width: consts.style.text.stroke.width
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
