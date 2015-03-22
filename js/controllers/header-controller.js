(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var HeaderController = function() {
    this.daysAgo = m.prop(183);
    this.daysAfter = m.prop(183);
    this.pixelsPerDay = m.prop(8);
  };

  HeaderController.prototype.dispatchEvent = function(event) {
    switch (event.type) {
    case 'click':
      switch(event.name) {
      case 'today':
        // TODO: click "today" button
        break;
      case 'edit':
        // TODO: click "edit" button
        break;
      default:
        break;
      }
      break;
    default:
      break;
    }
  };

  app.HeaderController = HeaderController;
  global.app = app;
})(this);