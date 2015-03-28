(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var LineChartTimelineController = app.LineChartTimelineController;
  var BarChartTimelineController = app.BarChartTimelineController;
  var lineChartTimelineView = app.lineChartTimelineView;
  var barChartTimelineView = app.barChartTimelineView;

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
      switch (controller.constructor) {
      case LineChartTimelineController:
        return lineChartTimelineView(controller);
      case BarChartTimelineController:
        return barChartTimelineView(controller);
      default:
        return;
      }
    }));
  };

  app.timelineListView = timelineListView;
  global.app = app;
})(this);