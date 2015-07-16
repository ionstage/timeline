(function(app) {
  'use strict';
  var m = require('mithril');
  var util = app.util || require('../util.js');

  var timeAxisView = function(ctrl) {
    var daysAgo = ctrl.daysAgo();
    var daysAfter = ctrl.daysAfter();
    var pixelsPerDay = ctrl.pixelsPerDay();

    var height = 31;

    return m('div.time-axis.unselectable', [
      m('svg', {
        width: (daysAfter + daysAgo + 1) * pixelsPerDay + 1,
        height: height,
        config: function(element, isInitialized) {
          if (isInitialized)
            return;
          ctrl.dispatchEvent({
            type: 'init',
            element: element
          });
        }
      }, [
        m('defs',[
          m('pattern', {
            id: 'time-axis-pattern',
            x: 0,
            y: 0,
            width: pixelsPerDay,
            height: height,
            patternUnits: 'userSpaceOnUse'
          }, [
            m('line', {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: height
            })
          ])
        ]),
        m('rect.background', {
          x: 0,
          y: 0,
          width: '100%',
          height: height,
          fill: 'url(#time-axis-pattern)',
          config: function(element, isInitialized, context) {
            if (!isInitialized)
              return;
            if (context.pixelsPerDay !== pixelsPerDay) {
              // set fill attribute to redraw time axis pattern for IE
              element.setAttribute('fill', 'url(#time-axis-pattern)');
            }
            context.pixelsPerDay = pixelsPerDay;
          }
        }),
        monthMarkerViews(daysAgo, daysAfter, pixelsPerDay, height),
        m('rect.today', {
          x: daysAgo * pixelsPerDay,
          y: 0,
          width: pixelsPerDay,
          height: height
        })
      ])
    ]);
  };

  var monthMarkerViews = function(daysAgo, daysAfter, pixelsPerDay, height) {
    var views = [];
    var today = util.startOfDay();
    for (var di = -daysAgo, dlen = daysAfter + 1; di < dlen; di++) {
      var date = util.addDays(today, di);
      if (date.getDate() !== 1)
        continue;
      var month = date.getMonth() + 1;
      var showYear = (month === 1 || month === 4 || month === 7 || month === 10);
      var x = (di + daysAgo) * pixelsPerDay;
      var width = showYear ? 60 : 20;
      var text = showYear ? date.getFullYear() + '/' + month : month;
      views.push(m('g.month', {
        transform: 'translate(' + x + ')'
      }, [
        m('line', {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: height
        }),
        m('rect', {
          x: showYear ? -30 : -10,
          y: 5,
          width: width,
          height: 20,
          rx: 5,
          ry: 5
        }),
        m('text.antialias', {
          x: 0,
          y: 20
        }, text)
      ]));
    }
    return views;
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = timeAxisView;
  else
    app.timeAxisView = timeAxisView;
})(this.app || (this.app = {}));