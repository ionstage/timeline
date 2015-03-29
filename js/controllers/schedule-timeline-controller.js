(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;
  var util = global.util;

  var TimelineController = app.TimelineController;

  var inherits = util.inherits;

  var ScheduleTimelineController = inherits(function(option) {
    ScheduleTimelineController.super_.call(this, option);
  }, TimelineController);

  app.ScheduleTimelineController = ScheduleTimelineController;
  global.app = app;
})(this);