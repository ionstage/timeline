(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var TimelineListController = function() {
    var noop = function() {};
    this.timelineControllers = m.prop([]);
    this.onscroll = noop;
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

  TimelineListController.prototype.dispatchEvent = function(event) {
    switch (event.type) {
    case 'scroll':
      m.redraw.strategy('none');
      invokeTimelineListController(this, 'scrollLeft', event.scrollLeft);
      this.onscroll(event);
      break;
    default:
      break;
    }
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