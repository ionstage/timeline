(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var HeaderController = function() {
    var noop = function() {};
    this.daysAgo = m.prop(183);
    this.daysAfter = m.prop(183);
    this.pixelsPerDay = m.prop(8);
    this.onchange = noop;
    this.ontoday = noop;
  };

  HeaderController.prototype.dispatchEvent = function(event) {
    switch (event.type) {
    case 'change':
      this[event.name](event.value);
      this.onchange(event);
      break;
    case 'click':
      switch(event.name) {
      case 'today':
        this.ontoday();
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