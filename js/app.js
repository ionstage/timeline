(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var document = global.document;

  app.controller = function() {};

  app.view = function(ctrl) {};

  m.module(document.getElementById('container'), app);
  global.app = app;
})(this);