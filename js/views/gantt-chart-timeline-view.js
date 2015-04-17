(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;
  var util = global.util;

  var sortBy = util.sortBy;
  var startOfDay = util.startOfDay;
  var addDays = util.addDays;
  var diffDays = util.diffDays;
  var openWindow = util.openWindow;

  var ganttChartTimelineView = function(ctrl) {
    var title = ctrl.title();
    var data = ctrl.data();
    var daysAgo = ctrl.daysAgo();
    var daysAfter = ctrl.daysAfter();
    var pixelsPerDay = ctrl.pixelsPerDay();
    var selectedIndex = ctrl.selectedIndex();
    var titleElement = ctrl.titleElement();

    var width = (daysAfter + daysAgo + 1) * pixelsPerDay + 1;
    var ganttChartItemsList = calcGanttChartItemsList(data, daysAgo, daysAfter, pixelsPerDay);
    var height = 32 + ganttChartItemsList.length * 24;

    return m('div.timeline.gantt-chart', {
      style: 'width: ' + width + 'px;',
      onclick: function(event) {
        var target = event.target;
        var className = target.getAttribute('class');
        if (!className || !className.match(/link/)) {
          m.redraw.strategy('none');
          return;
        }
        var index = +className.match(/index-(\d+)/)[1];
        var link = ganttChartItemsList[index].link;
        openWindow(link);
      }
    }, [
      m('div.title', {
        config: function(element, isInitialized) {
          if (element === titleElement)
            return;
          ctrl.dispatchEvent({
            type: 'init',
            titleElement: element
          });
        }
      }, title),
      m('svg.graph', {
        width: width,
        height: height,
        onmouseover: function(event) {
          var target = event.target;
          if (target.tagName !== 'rect')
            return;
          var indices = target.getAttribute('class').match(/index-(\d+)-(\d+)/).slice(1);
          var selectedIndex = indices.map(function(value) { return +value; });
          ctrl.dispatchEvent({
            type: 'select',
            selectedIndex: selectedIndex
          });
        },
        onmouseout: function(event) {
          var target = event.target;
          if (target.tagName !== 'rect')
            return;
          ctrl.dispatchEvent({
            type: 'select',
            selectedIndex: [-1, -1]
          });
        }
      }, [
        ganttChartItemsList.map(function(item, index) {
          var ganttChartItems = item.ganttChartItems;
          var tailX = item.tailX;
          var textX = item.textX;
          return m('g', [
            ganttChartItems.map(function(ganttChartItem, subIndex) {
              var duration = ganttChartItem.duration;
              var isSelected = selectedIndex[0] === index && selectedIndex[1] === subIndex;
              return m('rect', {
                className : 'index-' + index + '-' + subIndex + (isSelected ? ' selected' : ''),
                x: ganttChartItem.x + 1,
                y: ganttChartItem.y,
                width: (duration ? pixelsPerDay * duration - 2 : pixelsPerDay) + 0.5,
                height: 18,
                fill: ganttChartItem.color || 'gray'
              });
            }),
            m('text.label', {
              className : item.link ? 'link ' + 'index-' + index : '',
              x: textX,
              y: (index + 1) * 24 + 13
            }, item.value),
            deadlineView(item, daysAgo, pixelsPerDay, index, tailX)
          ]);
        }),
        tooltipView(selectedIndex, ganttChartItemsList, daysAgo, pixelsPerDay)
      ])
    ]);
  };

  var calcGanttChartItemsList = function(data, daysAgo, daysAfter, pixelsPerDay) {
    var width = (daysAfter + daysAgo + 1) * pixelsPerDay + 1;
    var ganttChartItemsList = [];

    return data.filter(function(item, index) {
      var ganttChartItems = calcGanttChartItems(item.data, daysAgo, pixelsPerDay, index);
      var endDate = addDays(startOfDay(), daysAfter);
      var firstDate = ganttChartFirstDate(item.data);
      var tailX = ganttChartTailX(ganttChartItems, pixelsPerDay);
      var textX = (deadlineX(item.deadline, daysAgo, pixelsPerDay) || tailX) + 8;

      // out of the range
      if (textX < 0 || diffDays(endDate, firstDate) < 0)
        return false;

      // cache the calculation results
      item.ganttChartItems = ganttChartItems;
      item.tailX = tailX;
      item.textX = textX;

      return true;
    });
  };

  var calcGanttChartItems = function(data, daysAgo, pixelsPerDay, step) {
    var beginDate = addDays(startOfDay(), -daysAgo);
    return sortBy(data, 'date').map(function(item) {
      return {
        x: diffDays(item.date, beginDate) * pixelsPerDay,
        y: (step + 1) * 24,
        duration: item.duration,
        value: item.value.toString(),
        color: item.color
      };
    });
  };

  var ganttChartFirstDate = function(data) {
    return data[0].date;
  };

  var ganttChartTailX = function(items, pixelsPerDay) {
    var lastItem = sortBy(items, 'date')[items.length - 1];
    var lastItemDuration = lastItem.duration;
    var lastItemWidth = lastItemDuration ? pixelsPerDay * lastItemDuration : pixelsPerDay;
    return lastItem.x + lastItemWidth;
  };

  var deadlineX = function(deadline, daysAgo, pixelsPerDay) {
    if (typeof deadline === 'undefined')
      return;
    var beginDate = addDays(startOfDay(), -daysAgo);
    var diff = diffDays(deadline, beginDate);
    if (diff < 0)
      return;
    return (diff + 1) * pixelsPerDay;
  };

  var tooltipView = function(selectedIndex, data, daysAgo, pixelsPerDay) {
    var index = selectedIndex[0];
    var subIndex = selectedIndex[1];
    var subData = (index !== -1) ? sortBy(data[index].data, 'date') : null;
    var value = (subIndex !== -1) ? subData[subIndex].value.toString() : '';
    var wideText = (encodeURI(value).length - value.length) / 8;
    var width = value.length * 8.4 + 8 + wideText * 5.6;
    var x = tooltipX(subIndex, subData, daysAgo, pixelsPerDay) || 0;
    var y = (index + 1) * 24;
    return m('g.tooltip.unselectable', {className: index === -1 ? 'hide' : ''}, [
      m('rect', {
        x: x - width / 2,
        y: y - 18 + (wideText ? -2 : 0),
        width: width,
        height: 16 + (wideText ? 2 : 0),
        rx: 5,
        ry: 5
      }, value),
      m('text', {
        x: x,
        y: y - 6
      }, value)
    ]);
  };

  var tooltipX = function(subIndex, subData, daysAgo, pixelsPerDay) {
    if (subIndex === -1 || !subData)
      return;
    var item = calcGanttChartItems(subData, daysAgo, pixelsPerDay)[subIndex];
    var duration = item.duration;
    return item.x + (duration ? pixelsPerDay * duration : pixelsPerDay) / 2;
  };

  var deadlineView = function(item, daysAgo, pixelsPerDay, step, tailX) {
    var deadline = item.deadline;
    if (!deadline)
      return;
    var beginDate = addDays(startOfDay(), -daysAgo);
    var x = (diffDays(deadline, beginDate) + 1) * pixelsPerDay - 0.5;
    var y = (step + 1) * 24;
    return m('g.deadline', [
      m('line.range', {
        className: (tailX >= x) ? 'hide' : '',
        x1: tailX,
        y1: y + 9,
        x2: x,
        y2: y + 9
      }),
      m('line.date', {
        x1: x,
        y1: y,
        x2: x,
        y2: y + 18
      }),
      triangleView(x, y + 3, x - 1.5, y, x + 1.5, y),
      triangleView(x, y + 15, x - 1.5, y + 18, x + 1.5, y + 18)
    ]);
  };

  var triangleView = function(x1, y1, x2, y2, x3, y3) {
    return m('polygon', {
      points: x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + x3 + ',' + y3
    });
  };

  app.ganttChartTimelineView = ganttChartTimelineView;
  global.app = app;
})(this);