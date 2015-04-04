(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var TimelineController = app.TimelineController;
  var lineChartTimelineView = app.lineChartTimelineView;
  var barChartTimelineView = app.barChartTimelineView;
  var scheduleTimelineView = app.scheduleTimelineView;
  var ganttChartTimelineView = app.ganttChartTimelineView;

  var timelineListView = function(ctrl) {
    var timelineControllers = ctrl.timelineControllers();
    return m('div.timeline-list', {
      onscroll: function(event) {
        ctrl.dispatchEvent({
          type: 'scroll',
          scrollLeft: this.scrollLeft
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
    }, timelineControllers.map(function(controller) {
      switch (controller.type()) {
      case TimelineController.TYPE_LINE_CHART:
        return lineChartTimelineView(controller);
      case TimelineController.TYPE_BAR_CHART:
        return barChartTimelineView(controller);
      case TimelineController.TYPE_SCHEDULE:
        return scheduleTimelineView(controller);
      case TimelineController.TYPE_GANTT_CHART:
        return ganttChartTimelineView(controller);
      default:
        return;
      }
    }));
  };

  app.timelineListView = timelineListView;
  global.app = app;
})(this);