(function(app) {
  'use strict';
  var m = require('mithril');
  var util = app.util || require('../util.js');

  var scheduleTimelineView = function(ctrl) {
    var title = ctrl.title();
    var data = ctrl.data();
    var daysAgo = ctrl.daysAgo();
    var daysAfter = ctrl.daysAfter();
    var pixelsPerDay = ctrl.pixelsPerDay();
    var titleElement = ctrl.titleElement();

    var width = (daysAfter + daysAgo + 1) * pixelsPerDay + 1;
    var sheduleItems = calcScheduleItems(data, daysAgo, daysAfter, pixelsPerDay);
    var sheduleItemsLength = sheduleItems.length;
    var height = sheduleItemsLength > 0 ? util.sortBy(sheduleItems, 'y')[sheduleItemsLength - 1].y + 22 : 28;

    return m('div.timeline.schedule', {
      style: 'width: ' + width + 'px;',
      onclick: function(event) {
        var target = event.target;
        var className = target.getAttribute('class');
        if (!className || !className.match(/link/)) {
          m.redraw.strategy('none');
          return;
        }
        var index = +className.match(/index-(\d+)/)[1];
        var link = sheduleItems[index].link;
        util.openWindow(link);
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
      }, [m('div.antialias', title)]),
      m('svg.graph', {
        width: width,
        height: height
      }, [
        sheduleItems.map(function(item, index) {
          var duration = item.duration;
          return m('g', {
            transform: 'translate(' + item.x + ')'
          }, [
            m('line', {
              x1: 0,
              y1: item.y,
              x2: duration ? pixelsPerDay * (duration - 1) : 0,
              y2: item.y,
              r: 4
            }),
            m('text.antialias', {
              className : item.link ? 'link ' + 'index-' + index : '',
              x: (duration ? pixelsPerDay * (duration - 1) : 0) + 8,
              y: item.y + 4
            }, item.value)
          ]);
        })
      ])
    ]);
  };

  var calcScheduleItems = function(data, daysAgo, daysAfter, pixelsPerDay) {
    var today = util.startOfDay();
    var beginDate = util.addDays(today, -daysAgo);
    var endDate = util.addDays(today, daysAfter);
    var stepWidthList = [];

    return util.sortBy(data, 'date').filter(function(item) {
      var duration = item.duration || 1;

      // before first date
      if (util.diffDays(util.addDays(item.date, duration - 1), beginDate) < 0)
        return false;

      // after the last date
      if (util.diffDays(endDate, item.date) < 0)
        return false;

      return true;
    }).map(function(item) {
      var x = (util.diffDays(item.date, beginDate) + 0.5) * pixelsPerDay;
      var duration = item.duration;
      var value = item.value.toString();
      var wideText = (encodeURI(value).length - value.length) / 8;
      var width = x + (duration ? pixelsPerDay * (duration - 1) : 0) + 8 + value.length * 8.4 + wideText * 5.6;

      for (var step = 0, len = stepWidthList.length; step < len; step++) {
        var stepWidth = stepWidthList[step];
        if (x > stepWidth + 8)
          break;
      }

      stepWidthList[step] = width;

      return {
        x: x,
        y: 32 + step * 20,
        duration: duration,
        value: value,
        link: item.link
      };
    });
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = scheduleTimelineView;
  else
    app.scheduleTimelineView = scheduleTimelineView;
})(this.app || (this.app = {}));