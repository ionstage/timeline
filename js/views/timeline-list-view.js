(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var timelineListView = function(ctrl) {
    return m('div.timeline-list');
  };

  app.timelineListView = timelineListView;
  global.app = app;
})(this);