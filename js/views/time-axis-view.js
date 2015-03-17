(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var timeAxisView = function(ctrl) {
    var daysAgo = ctrl.daysAgo();
    var daysAfter = ctrl.daysAfter();
    var pixelsPerDay = ctrl.pixelsPerDay();

    var height = 31;

    return m('div.time-axis', [
      m('svg', {
        width: (daysAfter - daysAgo + 1) * pixelsPerDay + 1,
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
        })
      ])
    ]);
  };

  app.timeAxisView = timeAxisView;
  global.app = app;
})(this);