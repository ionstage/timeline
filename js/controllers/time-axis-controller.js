(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var TimeAxisController = function() {
    this.daysAgo = m.prop(183);
    this.daysAfter = m.prop(183);
    this.pixelsPerDay = m.prop(8);
    this.element = m.prop(null);
  };

  TimeAxisController.prototype.scrollLeft = function(value) {
    var element = this.element();
    if (element)
      element.scrollLeft = value;
  };

  TimeAxisController.prototype.dispatchEvent = function(event) {
    switch (event.type) {
    case 'init':
      this.element(event.element);
      break;
    default:
      break;
    }
  };

  app.TimeAxisController = TimeAxisController;
  global.app = app;
})(this);