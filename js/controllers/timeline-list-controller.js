(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;
  var util = global.util;

  var invoke = util.invoke;

  var TimelineListController = function() {
    var noop = function() {};
    this.timelineControllers = m.prop([]);
    this.element = m.prop(null);
    this.oninit = noop;
    this.onscroll = noop;
  };

  TimelineListController.prototype.daysAgo = function(value) {
    invoke(this.timelineControllers(), 'daysAgo', value);
  };

  TimelineListController.prototype.daysAfter = function(value) {
    invoke(this.timelineControllers(), 'daysAfter', value);
  };

  TimelineListController.prototype.pixelsPerDay = function(value) {
    invoke(this.timelineControllers(), 'pixelsPerDay', value);
  };

  TimelineListController.prototype.scrollLeft = function(value) {
    var element = this.element();
    if (!element)
      return;
    if (typeof value === 'undefined')
      return element.scrollLeft;
    element.scrollLeft = value;
  };

  TimelineListController.prototype.dispatchEvent = function(event) {
    var timelineControllers = this.timelineControllers();

    switch (event.type) {
    case 'init':
      this.element(event.element);
      this.oninit();
      break;
    case 'scroll':
      m.redraw.strategy('none');
      invoke(timelineControllers, 'scrollLeft', event.scrollLeft);
      this.onscroll(event);
      break;
    default:
      break;
    }
  };

  app.TimelineListController = TimelineListController;
  global.app = app;
})(this);