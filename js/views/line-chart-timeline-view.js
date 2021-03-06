(function(app) {
  'use strict';
  var m = require('mithril');
  var util = app.util || require('../util.js');

  var lineChartTimelineView = function(ctrl) {
    var title = ctrl.title();
    var data = ctrl.data();
    var daysAgo = ctrl.daysAgo();
    var daysAfter = ctrl.daysAfter();
    var pixelsPerDay = ctrl.pixelsPerDay();
    var selectedIndex = ctrl.selectedIndex();
    var titleElement = ctrl.titleElement();

    var width = (daysAfter + daysAgo + 1) * pixelsPerDay + 1;
    var height = 160;
    var points = calcPoints(data, daysAgo, daysAfter, pixelsPerDay, height);

    return m('div.timeline.line-chart', {style: {width: width + 'px'}}, [
      m('div.title', {
        config: function(element, isInitialized) {
          if (element === titleElement)
            return;
          ctrl.dispatchEvent({
            type: 'init',
            titleElement: element
          });
        }
      }, [m('div.antialias', title)]),
      m('svg.graph', {
        width: width,
        height: height,
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

  var calcPoints = function(data, daysAgo, daysAfter, pixelsPerDay, height) {
    var dataSortedByValue = util.sortBy(data, 'value');
    var dataLength = data.length;
    var min = dataLength > 0 ? Math.min(dataSortedByValue[0].value, 0) : 0;
    var max = dataLength > 0 ? dataSortedByValue[dataLength - 1].value : 0;
    var today = util.startOfDay();
    var beginDate = util.addDays(today, -daysAgo);
    var endDate = util.addDays(today, daysAfter);

    return util.sortBy(data, 'date').filter(function(item, index, array) {
      var nextItem = array[index + 1];
      var prevItem = array[index - 1];

      // before the first date
      if (util.diffDays(item.date, beginDate) < 0 && nextItem && util.diffDays(nextItem.date, beginDate) < 0)
        return false;

      // after the last date
      if (util.diffDays(endDate, item.date) < 0 && prevItem && util.diffDays(endDate, prevItem.date) < 0)
        return false;

      return true;
    }).map(function(item) {
      return {
        x: (util.diffDays(item.date, beginDate) + 0.5) * pixelsPerDay,
        y: (max - item.value) / (max - min) * (height - 40) + 28
      };
    });
  };

  var tooltipView = function(index, data, points) {
    var value = index !== -1 ? data[index].value : '';
    var point = index !== -1 ? points[index] : {x: 0, y: 0};
    return m('g.tooltip.unselectable', {
      className: index === -1 ? 'hide' : '',
      transform: 'translate(' + point.x + ')'
    }, [
      m('rect', {
        x: 12,
        y: point.y - 8,
        width: value.toString().length * 8.4 + 8,
        height: 16,
        rx: 5,
        ry: 5
      }, value),
      m('text.antialias', {
        x: 16 + value.toString().length * 4.2,
        y: point.y + 4
      }, value)
    ]);
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = lineChartTimelineView;
  else
    app.lineChartTimelineView = lineChartTimelineView;
})(this.app || (this.app = {}));