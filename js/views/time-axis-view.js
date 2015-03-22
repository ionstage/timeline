(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var timeAxisView = function(ctrl) {
    var daysAgo = ctrl.daysAgo();
    var daysAfter = ctrl.daysAfter();
    var pixelsPerDay = ctrl.pixelsPerDay();

    var height = 31;

    var monthMarkerViews = [];
    var now = Date.now();
    for (var di = -daysAgo, dlen = daysAfter + 1; di < dlen; di++) {
      var date = new Date(now + di * 86400000);
      if (date.getDate() !== 1)
        continue;
      var month = date.getMonth() + 1;
      var showYear = (month === 1 || month === 4 || month === 7 || month === 10);
      var x = (di + daysAgo) * pixelsPerDay;
      var width = showYear ? 60 : 20;
      var text = showYear ? date.getFullYear() + '/' + month : month;
      monthMarkerViews.push(m('g.month', [
        m('line', {
          x1: x,
          y1: 0,
          x2: x,
          y2: height
        }),
        m('rect', {
          x: x - (showYear ? 30 : 10),
          y: 5,
          width: width,
          height: 20,
          rx: 5,
          ry: 5
        }),
        m('text', {
          x: x,
          y: 20
        }, text)
      ]));
    }

    return m('div.time-axis.unselectable', [
      m('svg', {
        width: (daysAfter + daysAgo + 1) * pixelsPerDay + 1,
        height: height
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
          height: height
        }),
        monthMarkerViews,
        m('rect.today', {
          x: daysAgo * pixelsPerDay,
          y: 0,
          width: pixelsPerDay,
          height: height
        })
      ])
    ]);
  };

  app.timeAxisView = timeAxisView;
  global.app = app;
})(this);