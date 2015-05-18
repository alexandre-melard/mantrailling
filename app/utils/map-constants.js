/**
 * Created by A140980 on 04/05/2015.
 */

// Geometrie
export const MULTILINE_STRING = "MultiLineString";
export const LINE_STRING = "LineString";
export const POLYGON = "Polygon";
export const MARKER = "Marker";
export const LOCATION = "Location";
export const TRAILER = "Trailer";
export const TEAM = "Team";

// Formats
export const GEO_JSON = "GeoJSON";
export const KML = "KML";
export const GPX = "GPX";
export const BREVET = "Basic";
export const LVL1 = "Intermediate";
export const LVL2 = "Advanced";
export const LVL3 = "Master";

export const COLORS = [
  ["#ffffff", "#000000", "#eeece1", "#1f497d", "#4f81bd", "#c0504d", "#9bbb59", "#8064a2", "#4bacc6", "#f79646", "#ffff00"],
  ["#f2f2f2", "#7f7f7f", "#ddd9c3", "#c6d9f0", "#dbe5f1", "#f2dcdb", "#ebf1dd", "#e5e0ec", "#dbeef3", "#fdeada", "#fff2ca"],
  ["#d8d8d8", "#595959", "#c4bd97", "#8db3e2", "#b8cce4", "#e5b9b7", "#d7e3bc", "#ccc1d9", "#b7dde8", "#fbd5b5", "#ffe694"],
  ["#bfbfbf", "#3f3f3f", "#938953", "#548dd4", "#95b3d7", "#d99694", "#c3d69b", "#b2a2c7", "#a5d0e0", "#fac08f", "#f2c314"],
  ["#a5a5a5", "#262626", "#494429", "#17365d", "#366092", "#953734", "#76923c", "#5f497a", "#92cddc", "#e36c09", "#c09100"],
  ["#7f7f7f", "#0c0c0c", "#1d1b10", "#0f243e", "#244061", "#632423", "#4f6128", "#3f3151", "#31859b", "#974806", "#7f6000"]
];

export const style = {
  text: {
    font: '18px Calibri,sans-serif',
    stroke: {
      width: 3
    }
  },
  trailer: {
    color: '#e727c0',
    start: {
      color: '#FFFF00',
      radius: 10,
      opacity: 0.5,
      stroke: {
        width: 2
      }
    },
    end: {
      color: '#FF0000',
      radius: 10,
      opacity: 0.5,
      stroke: {
        width: 2
      }
    }
  },
  team: {
    color: '#ec971f',
    stroke: {
      width: 4
    }
  },
  zone: {
    color: '#204d74',
    stroke: {
      width: 4
    }
  },
  point: {
    label: "",
    radius: 10,
    opacity: 0.5,
    color: '#ac2925',
    stroke: {
      width: 2
    }
  }
};
