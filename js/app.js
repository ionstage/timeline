(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var document = global.document;

  app.controller = function() {
    var HeaderController = app.HeaderController;
    var TimeAxisController = app.TimeAxisController;

    this.headerController = new HeaderController();
    this.timeAxisController = new TimeAxisController();
  };

  app.view = function(ctrl) {
    var headerView = app.headerView;
    var timeAxisView = app.timeAxisView;

    return [
      headerView(ctrl.headerController),
      timeAxisView(ctrl.timeAxisController)
    ];
  };

  m.module(document.getElementById('container'), app);
  global.app = app;
})(this);