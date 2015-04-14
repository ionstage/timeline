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
    }, timelineViews(ctrl));
  };

  var timelineViews = function(ctrl) {
    var timelineControllers = ctrl.timelineControllers();
    var someComplete = timelineControllers.some(function(controller) {
      return controller.state() === TimelineController.STATE_LOAD_COMPLETE;
    });

    if (timelineControllers.length === 0 || !someComplete) {
      var daysAgo = ctrl.daysAgo();
      var daysAfter = ctrl.daysAfter();
      var pixelsPerDay = ctrl.pixelsPerDay();
      var width = (daysAfter + daysAgo + 1) * pixelsPerDay + 1;
      return m('div.timeline.dummy', {style: 'width: ' + width + 'px'});
    }

    return timelineControllers.map(function(controller) {
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
    });
  };

  app.timelineListView = timelineListView;
  global.app = app;
})(this);