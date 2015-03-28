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
      if (controller.constructor === LineChartTimelineController)
        return lineChartTimelineView(controller);
      else if (controller.constructor === BarChartTimelineController)
        return barChartTimelineView(controller);
    }));
  };

  app.timelineListView = timelineListView;
  global.app = app;
})(this);