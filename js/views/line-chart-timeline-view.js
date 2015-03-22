(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;
  var util = global.util;

  var sortBy = util.sortBy;
  var startOfDay = util.startOfDay;
  var addDays = util.addDays;
  var diffDays = util.diffDays;

  var lineChartTimelineView = function(ctrl) {
    var title = ctrl.title();
    var data = ctrl.data();
    var daysAgo = ctrl.daysAgo();
    var daysAfter = ctrl.daysAfter();
    var pixelsPerDay = ctrl.pixelsPerDay();
    var selectedIndex = ctrl.selectedIndex();

    var width = (daysAfter - daysAgo + 1) * pixelsPerDay + 1;
    var height = 160;
    var points = calcPoints(data, daysAgo, pixelsPerDay, height);

    return m('div.timeline.line-chart', {style: 'width: ' + width + 'px;'}, [
      m('div.title', title),
      m('svg.graph', {
        height: height,
        width: width,
        onmouseover: function(event) {
          var target = event.target;
          if (target.tagName !== 'circle')
            return;
          var className = target.getAttribute('class');
          var index = +className.match(/index-(\d+)/)[1];
          ctrl.dispatchEvent({
            type: 'select',
            selectedIndex: index
          });
        },
        onmouseout: function(event) {
          var target = event.target;
          if (target.tagName !== 'circle')
            return;
          ctrl.dispatchEvent({
            type: 'select',
            selectedIndex: -1
          });
        }
      }, [
        points.map(function(point, index, points) {
          if (index === 0)
            return;
          var previousPoint = points[index - 1];
          return m('line', {
            x1: previousPoint.x,
            y1: previousPoint.y,
            x2: point.x,
            y2: point.y
          });
        }),
        points.map(function(point, index) {
          return m('circle', {
            cx: point.x,
            cy: point.y,
            r: 4,
            className: 'index-' + index + (selectedIndex === index ? ' selected' : '')
          });
        }),
        tooltipView(selectedIndex, data, points)
      ])
    ]);
  };

  var calcPoints = function(data, daysAgo, pixelsPerDay, height) {
    var dataSortedByValue = sortBy(data, 'value');
    var dataLength = data.length;
    var min = dataLength > 0 ? dataSortedByValue[0].value : 0;
    var max = dataLength > 0 ? dataSortedByValue[dataLength - 1].value : 0;
    var beginDate = addDays(startOfDay(), daysAgo);

    return sortBy(data, 'date').map(function(item) {
      return {
        x: (diffDays(item.date, beginDate) + 0.5) * pixelsPerDay,
        y: (max - item.value) / (max - min) * (height - 36) + 24
      };
    });
  };

  var tooltipView = function(index, data, points) {
    var value = index !== -1 ? data[index].value : '';
    var point = index !== -1 ? points[index] : {x: 0, y: 0};
    return m('g.tooltip.unselectable', {className: index !== -1 ? 'show' : 'hide'}, [
      m('rect', {
        x: point.x + 12,
        y: point.y - 8,
        width: value.toString().length * 8 + 8,
        height: 16,
        rx: 5,
        ry: 5
      }, value),
      m('text', {
        x: point.x + 16 + value.toString().length * 4,
        y: point.y + 4
      }, value)
    ]);
  };

  app.lineChartTimelineView = lineChartTimelineView;
  global.app = app;
})(this);