(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;
  var util = global.util;

  var TimelineController = app.TimelineController;

  var inherits = util.inherits;

  var LineChartTimelineController = inherits(function(option) {
    LineChartTimelineController.super_.call(this, option);
    this.selectedIndex = m.prop(-1);
  }, TimelineController);

  LineChartTimelineController.prototype.dispatchEvent = function(event) {
    LineChartTimelineController.super_.prototype.dispatchEvent.call(this, event);
    switch (event.type) {
    case 'select':
      this.selectedIndex(event.selectedIndex);
      break;
    default:
      break;
    }
  };

  app.LineChartTimelineController = LineChartTimelineController;
  global.app = app;
})(this);