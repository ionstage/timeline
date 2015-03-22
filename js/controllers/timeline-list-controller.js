(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var TimelineListController = function() {
    this.timelineControllers = m.prop([]);
  };

  app.TimelineListController = TimelineListController;
  global.app = app;
})(this);