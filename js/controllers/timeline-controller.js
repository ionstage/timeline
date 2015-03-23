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
    this.titleElement = m.prop(null);
  };

  TimelineController.prototype.scrollLeft = function(value) {
    var titleElement = this.titleElement();
    if (titleElement)
      titleElement.style.left = value + 'px';
  };

  TimelineController.prototype.dispatchEvent = function(event) {
    switch (event.type) {
    case 'init':
      this.titleElement(event.titleElement);
      break;
    default:
      break;
    }
  };

  app.TimelineController = TimelineController;
  global.app = app;
})(this);