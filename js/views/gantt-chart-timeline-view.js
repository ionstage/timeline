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

    var width = (daysAfter + daysAgo + 1) * pixelsPerDay + 1;
    var height = 32 + data.length * 24;
    var selectedIndexes = selectedIndex.split('-').map(function(index) { return +index; });

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
        var link = data[index].link;
        openWindow(link);
      }
    }, [
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
          if (!className)
            return;
          var indexes = className.match(/index-(\d+)-(\d+)/).slice(1);
          ctrl.dispatchEvent({
            type: 'select',
            selectedIndex: indexes.join('-')
          });
        },
        onmouseout: function(event) {
          var target = event.target;
          if (target.tagName !== 'rect')
            return;
          ctrl.dispatchEvent({
            type: 'select',
            selectedIndex: ''
          });
        }
      }, [
        data.map(function(item, index) {
          var ganttChartItems = calcGanttChartItems(item.data, daysAgo, pixelsPerDay, index);
          var ganttChartItemsLength = ganttChartItems.length;
          var ganttChartLastItem = sortBy(ganttChartItems, 'date')[ganttChartItemsLength - 1];
          var ganttChartLastItemDuration = ganttChartLastItem.duration;
          var ganttChartLastItemWidth = ganttChartLastItemDuration ? pixelsPerDay * ganttChartLastItemDuration : pixelsPerDay;
          var lastX = ganttChartLastItem.x + ganttChartLastItemWidth;
          var deadline = item.deadline;
          var deadlineX = 0;
          if (deadline) {
            var beginDate = addDays(startOfDay(), -daysAgo);
            deadlineX = Math.max((diffDays(deadline, beginDate) + 1) * pixelsPerDay - lastX, 0);
          }
          return m('g', [
            ganttChartItems.map(function(ganttChartItem, subIndex) {
              var duration = ganttChartItem.duration;
              var isSelected = selectedIndexes[0] === index && selectedIndexes[1] === subIndex;
              return m('rect', {
                className : 'index-' + index + '-' + subIndex + (isSelected ? ' selected' : ''),
                x: ganttChartItem.x + 1,
                y: ganttChartItem.y,
                width: (duration ? pixelsPerDay * duration - 2 : pixelsPerDay) + 0.5,
                height: 18,
                fill: ganttChartItem.color || 'gray'
              });
            }),
            m('text', {
              className : item.link ? 'link ' + 'index-' + index : '',
              x: lastX + deadlineX + 8,
              y: (index + 1) * 24 + 13
            }, item.value),
            deadlineView(item, daysAgo, pixelsPerDay, index, lastX)
          ]);
        }),
        tooltipView(selectedIndexes, data, daysAgo, pixelsPerDay)
      ])
    ]);
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

  var tooltipView = function(indexes, data, daysAgo, pixelsPerDay) {
    var index = indexes[0];
    var subIndex = indexes[1];
    var subData = sortBy(data[index].data, 'date');
    var value = (typeof subIndex !== 'undefined') ? subData[subIndex].value : '';
    var width = value.toString().length * 8.4 + 8;
    var point = {x: 0, y: (index + 1) * 24};
    if (typeof subIndex !== 'undefined') {
      var ganttChartItems = calcGanttChartItems(subData, daysAgo, pixelsPerDay);
      var selectedItem = ganttChartItems[subIndex];
      var selectedItemDuration = selectedItem.duration;
      point.x = selectedItem.x + (selectedItemDuration ? pixelsPerDay * selectedItemDuration : pixelsPerDay) / 2
    }
    return m('g.tooltip.unselectable', {className: index === -1 ? 'hide' : ''}, [
      m('rect', {
        x: point.x - width / 2,
        y: point.y - 18,
        width: width,
        height: 16,
        rx: 5,
        ry: 5
      }, value),
      m('text', {
        x: point.x,
        y: point.y - 6
      }, value)
    ]);
  };

  var deadlineView = function(item, daysAgo, pixelsPerDay, step, lastX) {
    var deadline = item.deadline;
    if (!deadline)
      return;
    var beginDate = addDays(startOfDay(), -daysAgo);
    var x = (diffDays(deadline, beginDate) + 1) * pixelsPerDay - 0.5;
    var y = (step + 1) * 24;
    return m('g.deadline', [
      m('line.range', {
        className: (lastX >= x) ? 'hide' : '',
        x1: lastX,
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
      m('polygon', {
        points: x + ',' + (y + 3) + ' ' + (x - 1.5) + ',' + y + ' ' + (x + 1.5) + ',' + y + ' '
      }),
      m('polygon', {
        points: x + ',' + (y + 15) + ' ' + (x - 1.5) + ',' + (y + 18) + ' ' + (x + 1.5) + ',' + (y + 18) + ' '
      })
    ]);
  };

  app.ganttChartTimelineView = ganttChartTimelineView;
  global.app = app;
})(this);