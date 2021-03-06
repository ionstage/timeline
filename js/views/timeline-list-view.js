(function(app) {
  'use strict';
  var m = require('mithril');
  var TimelineController = app.TimelineController || require('../controllers/timeline-controller.js');
  var lineChartTimelineView = app.lineChartTimelineView || require('./line-chart-timeline-view.js');
  var barChartTimelineView = app.barChartTimelineView || require('./bar-chart-timeline-view.js');
  var scheduleTimelineView = app.scheduleTimelineView || require('./schedule-timeline-view.js');
  var ganttChartTimelineView = app.ganttChartTimelineView || require('./gantt-chart-timeline-view.js');

  var timelineListView = function(ctrl) {
    var visibleTimelineControllers = ctrl.timelineControllers().filter(function(timelineController) {
      return timelineController.visible();
    });

    return m('div.timeline-list', {
      onscroll: function(event) {
        var element = event.currentTarget;
        ctrl.dispatchEvent({
          type: 'scroll',
          scrollLeft: element.scrollLeft
        });
      },
      config: function(element, isInitialized) {
        if (isInitialized)
          return;
        ctrl.dispatchEvent({
          type: 'init',
          element: element
        });
      }
    }, [
      timelineViews(ctrl),
      m('div.spacer', {
        className: visibleTimelineControllers.length === 0 ? 'empty' : ''
      })
    ]);
  };

  var timelineViews = function(ctrl) {
    var visibleTimelineControllers = ctrl.timelineControllers().filter(function(timelineController) {
      return timelineController.visible();
    });
    var someComplete = visibleTimelineControllers.some(function(timelineController) {
      return timelineController.state() === TimelineController.STATE_LOAD_COMPLETE;
    });

    if (visibleTimelineControllers.length === 0 || !someComplete) {
      var daysAgo = ctrl.daysAgo();
      var daysAfter = ctrl.daysAfter();
      var pixelsPerDay = ctrl.pixelsPerDay();
      var width = (daysAfter + daysAgo + 1) * pixelsPerDay + 1;
      return m('div.timeline.dummy', {style: {width: width + 'px'}});
    }

    return visibleTimelineControllers.map(function(timelineController) {
      switch (timelineController.type()) {
      case TimelineController.TYPE_LINE_CHART:
        return lineChartTimelineView(timelineController);
      case TimelineController.TYPE_BAR_CHART:
        return barChartTimelineView(timelineController);
      case TimelineController.TYPE_SCHEDULE:
        return scheduleTimelineView(timelineController);
      case TimelineController.TYPE_GANTT_CHART:
        return ganttChartTimelineView(timelineController);
      default:
        return;
      }
    });
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = timelineListView;
  else
    app.timelineListView = timelineListView;
})(this.app || (this.app = {}));