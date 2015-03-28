(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;
  var util = global.util;

  var sortBy = util.sortBy;
  var startOfDay = util.startOfDay;
  var addDays = util.addDays;
  var diffDays = util.diffDays;

  var barChartTimelineView = function(ctrl) {
    var title = ctrl.title();
    var data = ctrl.data();
    var daysAgo = ctrl.daysAgo();
    var daysAfter = ctrl.daysAfter();
    var pixelsPerDay = ctrl.pixelsPerDay();
    var selectedIndex = ctrl.selectedIndex();

    var width = (daysAfter + daysAgo + 1) * pixelsPerDay + 1;
    var height = 160;
    var points = calcPoints(data, daysAgo, pixelsPerDay, height);

    return m('div.timeline.bar-chart', {style: 'width: ' + width + 'px;'}, [
      m('div.title', {
        config: function(element, isInitialized) {
          if (isInitialized)
            return;
          ctrl.dispatchEvent({
            type: 'init',
            titleElement: element
          });
        }
      }, title),
      m('svg.graph', {
        height: height,
        width: width,
        onmouseover: function(event) {
          var target = event.target;
          if (target.tagName !== 'rect')
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
          if (target.tagName !== 'rect')
            return;
          ctrl.dispatchEvent({
            type: 'select',
            selectedIndex: -1
          });
        }
      }, [
        points.map(function(point, index) {
          return m('rect', {
            x: point.x,
            y: point.y,
            width: pixelsPerDay + 0.5,
            height: height - point.y,
            className: 'index-' + index + (selectedIndex === index ? ' selected' : '')
          });
        }),
        tooltipView(selectedIndex, data, points, pixelsPerDay)
      ])
    ]);
  };

  var calcPoints = function(data, daysAgo, pixelsPerDay, height) {
    var dataSortedByValue = sortBy(data, 'value');
    var dataLength = data.length;
    var max = dataLength > 0 ? dataSortedByValue[dataLength - 1].value : 0;
    var beginDate = addDays(startOfDay(), -daysAgo);

    return sortBy(data, 'date').map(function(item) {
      return {
        x: (diffDays(item.date, beginDate)) * pixelsPerDay,
        y: (max - item.value) / max * (height - 24) + 24
      };
    });
  };

  var tooltipView = function(index, data, points, pixelsPerDay) {
    var value = index !== -1 ? data[index].value : '';
    var point = index !== -1 ? points[index] : {x: 0, y: 0};
    var width = value.toString().length * 8 + 8;
    return m('g.tooltip.unselectable', {className: index !== -1 ? 'show' : 'hide'}, [
      m('rect', {
        x: point.x + (pixelsPerDay - width) / 2,
        y: point.y - 18,
        width: width,
        height: 16,
        rx: 5,
        ry: 5
      }, value),
      m('text', {
        x: point.x + pixelsPerDay / 2,
        y: point.y - 6
      }, value)
    ]);
  };

  app.barChartTimelineView = barChartTimelineView;
  global.app = app;
})(this);