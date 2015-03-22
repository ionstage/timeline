(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var TimelineController = function(option) {
    this.title = m.prop(option.title);
    this.data = m.prop(option.data);
    this.daysAgo = m.prop(option.daysAgo);
    this.daysAfter = m.prop(option.daysAfter);
    this.pixelsPerDay = m.prop(option.pixelsPerDay);
  };

  TimelineController.prototype.dispatchEvent = function(event) {
    switch (event.type) {
    default:
      break;
    }
  };

  app.TimelineController = TimelineController;
  global.app = app;
})(this);