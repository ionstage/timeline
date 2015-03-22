(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var LineChartTimelineController = app.LineChartTimelineController;
  var lineChartTimelineView = app.lineChartTimelineView;

  var timelineListView = function(ctrl) {
    var timelineControllers = ctrl.timelineControllers();
    return m('div.timeline-list', timelineControllers.map(function(controller) {
      if (controller.constructor === LineChartTimelineController)
        return lineChartTimelineView(controller)
    }));
  };

  app.timelineListView = timelineListView;
  global.app = app;
})(this);