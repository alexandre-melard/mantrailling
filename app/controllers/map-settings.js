import Ember from 'ember';
import getStyleFunction from "../utils/map-style";
import consts from "../utils/map-constants";

/**
 * Created by alex on 29/03/2015.
 */
export default Ember.Controller.extend({
  initLineString: function() {
    var lineStringColor = this.store.createRecord('mapStyleColor', consts.style.LineString.stroke.color).save();
    var lineStringStroke = this.store.createRecord('mapStyleStroke', {color: lineStringColor, width: consts.style.LineString.stroke.width}).save();
    var lineStringFill = this.store.createRecord('mapStyleFill', {color: lineStringColor}).save();
    var lineStringOffset = this.store.createRecord('mapStyleOffset', consts.style.LineString.text.offset).save();
    var lineStringText = this.store.createRecord('mapStyletext', {
      offset: lineStringOffset,
      font: consts.style.LineString.text.font,
      fill: lineStringFill,
      stroke: lineStringStroke
    }).save();

    var lineStringStartColor = this.store.createRecord('mapStyleColor', {hexa: '#0000ff', opacity: '0.5'}).save();
    var lineStringStartFill = this.store.createRecord('mapStyleFill', {color: lineStringStartColor}).save();
    var lineStringStartStroke = this.store.createRecord('mapStyleStroke', {color: lineStringStartColor, width: 1}).save();
    var lineStringStartText = this.store.createRecord('mapStyletext', {
      offset: lineStringOffset,
      font: '18px Calibri,sans-serif',
      fill: lineStringStartFill,
      stroke: lineStringStartStroke
    }).save();
    var lineStringStart = this.store.createRecord('mapStylePoint', {
      radius: 5,
      fill: lineStringStartFill,
      stroke: lineStringStartStroke,
      text: lineStringStartText
    }).save();

    var lineStringEndColor = this.store.createRecord('mapStyleColor', {hexa: '#0000ff', opacity: '0.5'}).save();
    var lineStringEndFill = this.store.createRecord('mapStyleFill', {color: lineStringEndColor}).save();
    var lineStringEndStroke = this.store.createRecord('mapStyleStroke', {color: lineStringEndColor, width: 1}).save();
    var lineStringEndText = this.store.createRecord('mapStyletext', {
      offset: lineStringOffset,
      font: '18px Calibri,sans-serif',
      fill: lineStringEndFill,
      stroke: lineStringEndStroke
    }).save();
    var lineStringEnd = this.store.createRecord('mapStylePoint', {
      radius: 5,
      fill: lineStringEndFill,
      stroke: lineStringEndStroke,
      text: lineStringEndText
    }).save();

    var lineString = this.store.createRecord('mapStyleLinestring', {
      stroke: lineStringStroke,
      text: lineStringText,
      start: lineStringStart,
      end: lineStringEnd
    }).save();

    return lineString.save();
  },

  init: function () {
    this._super();
    var style = this.store.find('mtgStyle');
    if (Ember.isEmpty(style)) {
      var lineString = this.initLineString();
      style = this.store.createRecord('mtgStyle', {LineString: lineString}).save();

      var trailer = this.store.createRecord('mapStyleLinestring');
      var team = this.store.createRecord('mapStyleLinestring');
      var polygon = this.store.createRecord('mapStylePolygon');
      var point = this.store.createRecord('mapStylePoint');

      style = {
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
        }
      };
    }
  }
});
