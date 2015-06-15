/**
 * Created by A140980 on 04/05/2015.
 */

export const VERSION = "2.3.0";

// Geometrie
export const MULTILINE_STRING = "MultiLineString";
export const LINE_STRING = "LineString";
export const POLYGON = "Polygon";
export const POINT = "Point";
export const MARKER = "Marker";
export const ITEM = "Item";
export const LOCATION = "Location";
export const TRAILER = "Trailer";
export const TEAM = "Team";

// Formats
export const GEO_JSON = "GeoJSON";
export const KML = "KML";
export const GPX = "GPX";

export const COLORS = [
  ["#ffffff", "#000000", "#eeece1", "#1f497d", "#4f81bd", "#c0504d", "#9bbb59", "#8064a2", "#4bacc6", "#f79646", "#ffff00"],
  ["#f2f2f2", "#7f7f7f", "#ddd9c3", "#c6d9f0", "#dbe5f1", "#f2dcdb", "#ebf1dd", "#e5e0ec", "#dbeef3", "#fdeada", "#fff2ca"],
  ["#d8d8d8", "#595959", "#c4bd97", "#8db3e2", "#b8cce4", "#e5b9b7", "#d7e3bc", "#ccc1d9", "#b7dde8", "#fbd5b5", "#ffe694"],
  ["#bfbfbf", "#3f3f3f", "#938953", "#548dd4", "#95b3d7", "#d99694", "#c3d69b", "#b2a2c7", "#a5d0e0", "#fac08f", "#f2c314"],
  ["#a5a5a5", "#262626", "#494429", "#17365d", "#366092", "#953734", "#76923c", "#5f497a", "#92cddc", "#e36c09", "#c09100"],
  ["#7f7f7f", "#0c0c0c", "#1d1b10", "#0f243e", "#244061", "#632423", "#4f6128", "#3f3151", "#31859b", "#974806", "#7f6000"]
];

export const style = {
  LineString: {
    stroke: {
      color: {
        hexa: '#0000ff',
        opacity: '0.8'
      },
      width: 2
    },
    text: {
      offset: {
        x: 0,
        y: 0
      },
      font: '18px Calibri,sans-serif',
      fill: {
        color: {
          hexa: '#0000ff'
        }
      },
      stroke: {
        color: {
          hexa: '#0000ff'
        },
        width: 3
      }
    },
    start: {
      color: '#000000',
      radius: 5,
      opacity: 0.5,
      stroke: {
        width: 1
      }
    },
    end: {
      color: '#0000ff',
      radius: 5,
      opacity: 0.5,
      stroke: {
        width: 1
      }
    }
  },
  Trailer: {
    stroke: {
      color: {
        hexa: '#e727c0',
        opacity: '0.8'
      },
      width: 4
    },
    text: {
      offset: {
        x: 0,
        y: 0
      },
      font: '18px Calibri,sans-serif',
      fill: {
        color: {
          hexa: '#e727c0'
        }
      },
      stroke: {
        color: {
          hexa: '#e727c0'
        },
        width: 3
      }
    },
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
  Team: {
    stroke: {
      color: {
        hexa: '#ec971f',
        opacity: '0.8'
      },
      width: 2
    },
    text: {
      offset: {
        x: 0,
        y: 0
      },
      font: '18px Calibri,sans-serif',
      fill: {
        color: {
          hexa: '#ec971f'
        }
      },
      stroke: {
        color: {
          hexa: '#ec971f'
        },
        width: 3
      }
    },
    start: {
      color: '#FFFF00',
      radius: 5,
      opacity: 0.5,
      stroke: {
        width: 1
      }
    },
    end: {
      color: '#FF0000',
      radius: 5,
      opacity: 0.5,
      stroke: {
        width: 1
      }
    }
  },
  Polygon: {
    fill: {
      color: {
        hexa: '#204d74',
        opacity: '0.2'
      }
    },
    stroke: {
      color: {
        hexa: '#204d74',
        opacity: '0.8'
      },
      width: 4
    },
    text: {
      offset: {
        x: 0,
        y: 0
      },
      font: '18px Calibri,sans-serif',
      fill: {
        color: {
          hexa: '#204d74'
        }
      },
      stroke: {
        color: {
          hexa: '#204d74'
        },
        width: 3
      }
    }
  },
  Point: {
    radius: 10,
    fill: {
      color: {
        hexa: '#ac2925',
        opacity: '0.5'
      }
    },
    stroke: {
      color: {
        hexa: '#ac2925',
        opacity: '0.8'
      },
      width: 2
    },
    text: {
      offset: {
        x: 0,
        y: 0
      },
      font: '18px Calibri,sans-serif',
      fill: {
        color: {
          hexa: '#ac2925'
        }
      },
      stroke: {
        color: {
          hexa: '#ac2925'
        },
        width: 3
      }
    }
  },
  Item: {
    radius: 15,
    fill: {
      color: {
        hexa: '#00aa00',
        opacity: '0.3'
      }
    },
    stroke: {
      color: {
        hexa: '#00aa00',
        opacity: '0.8'
      },
      width: 2
    },
    text: {
      offset: {
        x: 0,
        y: 0
      },
      font: '18px Calibri,sans-serif',
      fill: {
        color: {
          hexa: '#00aa00'
        }
      },
      stroke: {
        color: {
          hexa: '#ac2925'
        },
        width: 3
      }
    }
  },
  Location: {
    radius: 10,
    fill: {
      color: {
        hexa: '#0000ff',
        opacity: '0.3'
      }
    },
    stroke: {
      color: {
        hexa: '#0000ff',
        opacity: '0.8'
      },
      width: 2
    },
    text: {
      offset: {
        x: 0,
        y: 0
      },
      font: '18px Calibri,sans-serif',
      fill: {
        color: {
          hexa: '#ac2925'
        }
      },
      stroke: {
        color: {
          hexa: '#ac2925'
        },
        width: 3
      }
    }
  }
};
