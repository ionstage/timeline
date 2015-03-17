(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var TimeAxisController = function() {
    this.daysAgo = m.prop(-183);
    this.daysAfter = m.prop(183);
    this.pixelsPerDay = m.prop(8);
  };

  app.TimeAxisController = TimeAxisController;
  global.app = app;
})(this);