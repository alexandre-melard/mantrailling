/**
 * Created by a140980 on 17/04/2015.
 */
import formatLength from "../utils/map-format-length.js";
import formatArea from "../utils/map-format-area.js";

/**
 * Message to show when the user is drawing a polygon.
 * @type {string}
 */
var continuePolygonMsg = 'Click to continue drawing the polygon';

/**
 * Message to show when the user is drawing a line.
 * @type {string}
 */
var continueLineMsg = 'Click to continue drawing the line';

export default {
  helpTooltipElement: null,
  helpTooltip: null,
  measureTooltipElement: null,
  measureTooltip: null,
  sketch: null,
  map: null,

  removePointerMoveHandler: function (map) {
    this.deleteTooltip(map, null, null, this.moveListenerKey);
    this.moveListenerKey = null;
  },

  /**
   * Handle pointer move.
   * @param {ol.MapBrowserEvent} evt
   */
  pointerMoveHandler: function (evt) {
    if (evt.dragging) {
      return;
    }
    /** @type {string} */
    var helpMsg = 'Click to start drawing';
    /** @type {ol.Coordinate|undefined} */
    var tooltipCoord = evt.coordinate;

    if (this.sketch) {
      var output = null;
      var geom = this.sketch.getGeometry();
      if (geom instanceof ol.geom.Polygon) {
        output = formatArea(this.map, geom);
        helpMsg = continuePolygonMsg;
        tooltipCoord = geom.getInteriorPoint().getCoordinates();
      } else if (geom instanceof ol.geom.LineString) {
        output = formatLength(this.map, geom);
        helpMsg = continueLineMsg;
        tooltipCoord = geom.getLastCoordinate();
      } else if (this.mtgDrawState === "Marker") {
        helpMsg = "Click to add a comment";
      } else if (this.mtgDrawState === "Point") {
        helpMsg = "Click to add a point";
      }
      if (output) {
        this.measureTooltipElement.innerHTML = output;
        this.measureTooltip.setPosition(tooltipCoord);
      }
    }
    this.helpTooltipElement.innerHTML = helpMsg;
    this.helpTooltip.setPosition(evt.coordinate);
  },

  createTooltip: function (map, tooltipDom, tooltipOverlay, options) {
    if (tooltipDom !== null) {
      tooltipDom.parentNode.removeChild(tooltipDom);
    }
    tooltipDom = document.createElement('div');
    tooltipDom.className = 'mtg-tooltip';
    tooltipOverlay = new ol.Overlay(
      $.extend({element: tooltipDom}, options)
    );
    map.addOverlay(tooltipOverlay);
    return {overlay: tooltipOverlay, element: tooltipDom};
  },

  /**
   * Creates a new help tooltip
   */
  createHelpTooltip: function (map) {
    var ret = this.createTooltip(map, this.helpTooltipElement, this.helpTooltip,
      {
        offset: [15, 0],
        positioning: 'center-left'
      });
    this.helpTooltip = ret.overlay;
    this.helpTooltipElement = ret.element;
  },

  /**
   * Creates a new measure tooltip
   */
  createMeasureTooltip: function (map) {
    var ret = this.createTooltip(map, this.measureTooltipElement, this.measureTooltip,
      {
        offset: [0, -15],
        positioning: 'bottom-center'
      });
    this.measureTooltip = ret.overlay;
    this.measureTooltipElement = ret.element;
  },

  createTooltips: function (map, sketch) {
    this.createMeasureTooltip(map);
    this.createHelpTooltip(map);
    this.sketch = sketch;
    this.map = map;
    this.moveListenerKey = map.on('pointermove', this.pointerMoveHandler, this);
  },

  deleteTooltip: function (map, tooltipDom, tooltipOverlay, moveListenerKey) {
    if (tooltipDom !== undefined && tooltipDom !== null) {
      tooltipDom.parentNode.removeChild(tooltipDom);
    }
    if (tooltipOverlay !== undefined && tooltipOverlay !== null) {
      map.removeOverlay(tooltipOverlay);
    }
    if (moveListenerKey !== undefined) {
      map.unByKey(moveListenerKey);
    }
  },

  /**
   * Creates a new help tooltip
   */
  deleteHelpTooltip: function (map) {
    this.deleteTooltip(map, this.helpTooltipElement, this.helpTooltip);
    this.helpTooltipElement = null;
    this.helpTooltip = null;
  },

  /**
   * Creates a new measure tooltip
   */
  deleteMeasureTooltip: function (map) {
    this.deleteTooltip(map, this.measureTooltipElement, this.measureTooltip);
    this.measureTooltipElement = null;
    this.measureTooltip = null;
  },

  deleteTooltips: function (map) {
    this.deleteHelpTooltip(map);
    this.deleteMeasureTooltip(map);
    this.removePointerMoveHandler(map);
  },

  resetTooltips: function (map) {
    this.deleteTooltips(map);
    this.createTooltips(map);
  }
};
