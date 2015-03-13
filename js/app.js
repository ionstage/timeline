(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var document = global.document;

  app.controller = function() {
    var HeaderController = app.HeaderController;

    this.headerController = new HeaderController();
  };

  app.view = function(ctrl) {
    var headerView = app.headerView;

    return [
      headerView(this.headerController)
    ];
  };

  m.module(document.getElementById('container'), app);
  global.app = app;
})(this);