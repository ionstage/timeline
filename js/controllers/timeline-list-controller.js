(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var TimelineListController = function() {
    this.timelineControllers = m.prop([]);
  };

  TimelineListController.prototype.daysAgo = function(value) {
    invokeTimelineListController(this, 'daysAgo', value);
  };

  TimelineListController.prototype.daysAfter = function(value) {
    invokeTimelineListController(this, 'daysAfter', value);
  };

  TimelineListController.prototype.pixelsPerDay = function(value) {
    invokeTimelineListController(this, 'pixelsPerDay', value);
  };

  var invokeTimelineListController = function(ctrl, name, value) {
    var timelineControllers = ctrl.timelineControllers();
    timelineControllers.forEach(function(controller) {
      controller[name](value);
    });
  };

  app.TimelineListController = TimelineListController;
  global.app = app;
})(this);