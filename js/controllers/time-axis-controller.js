(function(app) {
  'use strict';
  var m = require('mithril');
  var util = app.util || require('../util.js');

  var TimeAxisController = function() {
    this.daysAgo = m.prop(183);
    this.daysAfter = m.prop(183);
    this.pixelsPerDay = m.prop(8);
    this.element = m.prop(null);
  };

  TimeAxisController.prototype.scrollLeft = function(value) {
    var element = this.element();
    if (element)
      util.translateX(element, -value);
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

  if (typeof module !== 'undefined' && module.exports)
    module.exports = TimeAxisController;
  else
    app.TimeAxisController = TimeAxisController;
})(this.app || (this.app = {}));