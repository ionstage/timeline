(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;
  var util = global.util;

  var TimelineController = app.TimelineController;

  var inherits = util.inherits;

  var GanttChartTimelineController = inherits(function(option) {
    GanttChartTimelineController.super_.call(this, option);
    this.selectedIndex = m.prop([-1, -1]);
  }, TimelineController);

  GanttChartTimelineController.prototype.dispatchEvent = function(event) {
    GanttChartTimelineController.super_.prototype.dispatchEvent.call(this, event);
    switch (event.type) {
    case 'select':
      this.selectedIndex(event.selectedIndex);
      break;
    default:
      break;
    }
  };

  app.GanttChartTimelineController = GanttChartTimelineController;
  global.app = app;
})(this);