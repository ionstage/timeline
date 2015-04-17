(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;
  var util = global.util;

  var invoke = util.invoke;

  var TimelineListController = function() {
    var noop = function() {};
    this.daysAgo = daysAgoProp();
    this.daysAfter = daysAfterProp();
    this.pixelsPerDay = pixelsPerDayProp();
    this.timelineControllers = m.prop([]);
    this.element = m.prop(null);
    this.oninit = noop;
    this.onscroll = noop;
  };

  var daysAgoProp = function(value) {
    var cacheProp = m.prop(183);
    return function(value) {
      if (typeof value === 'undefined')
        return cacheProp();
      cacheProp(value);
      invoke(this.timelineControllers(), 'daysAgo', value);
    };
  };

  var daysAfterProp = function(value) {
    var cacheProp = m.prop(183);
    return function(value) {
      if (typeof value === 'undefined')
        return cacheProp();
      cacheProp(value);
      invoke(this.timelineControllers(), 'daysAfter', value);
    };
  };

  var pixelsPerDayProp = function(value) {
    var cacheProp = m.prop(8);
    return function(value) {
      if (typeof value === 'undefined')
        return cacheProp();
      cacheProp(value);
      invoke(this.timelineControllers(), 'pixelsPerDay', value);
    };
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