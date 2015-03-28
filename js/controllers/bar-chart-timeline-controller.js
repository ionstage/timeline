(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;
  var util = global.util;

  var TimelineController = app.TimelineController;

  var inherits = util.inherits;

  var BarChartTimelineController = inherits(function(option) {
    BarChartTimelineController.super_.call(this, option);
    this.selectedIndex = m.prop(-1);
  }, TimelineController);

  BarChartTimelineController.prototype.dispatchEvent = function(event) {
    BarChartTimelineController.super_.prototype.dispatchEvent.call(this, event);
    switch (event.type) {
    case 'select':
      this.selectedIndex(event.selectedIndex);
      break;
    default:
      break;
    }
  };

  app.BarChartTimelineController = BarChartTimelineController;
  global.app = app;
})(this);