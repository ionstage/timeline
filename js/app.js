(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var document = global.document;

  app.controller = function() {
    var HeaderController = app.HeaderController;
    var TimeAxisController = app.TimeAxisController;
    var TimelineListController = app.TimelineListController;

    this.headerController = new HeaderController();
    this.timeAxisController = new TimeAxisController();
    this.timelineListController = new TimelineListController();
  };

  app.view = function(ctrl) {
    var headerView = app.headerView;
    var timeAxisView = app.timeAxisView;
    var timelineListView = app.timelineListView;

    return [
      headerView(ctrl.headerController),
      timeAxisView(ctrl.timeAxisController),
      timelineListView(ctrl.timelineListController)
    ];
  };

  m.module(document.getElementById('container'), app);
  global.app = app;
})(this);