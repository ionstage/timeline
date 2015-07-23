(function(app) {
  'use strict';
  var m = require('mithril');
  var util = app.util || require('../util.js');

  var TimelineListController = function() {
    var noop = function() {};
    this.daysAgo = daysAgoProp();
    this.daysAfter = daysAfterProp();
    this.pixelsPerDay = pixelsPerDayProp();
    this.timelineControllers = m.prop([]);
    this.element = m.prop(null);
    this.oninit = noop;
    this.onscroll = noop;
  };

  var daysAgoProp = function(value) {
    var cacheProp = m.prop(183);
    return function(value) {
      if (typeof value === 'undefined')
        return cacheProp();
      cacheProp(value);
      util.invoke(this.timelineControllers(), 'daysAgo', value);
    };
  };

  var daysAfterProp = function(value) {
    var cacheProp = m.prop(183);
    return function(value) {
      if (typeof value === 'undefined')
        return cacheProp();
      cacheProp(value);
      util.invoke(this.timelineControllers(), 'daysAfter', value);
    };
  };

  var pixelsPerDayProp = function(value) {
    var cacheProp = m.prop(8);
    return function(value) {
      if (typeof value === 'undefined')
        return cacheProp();
      cacheProp(value);
      util.invoke(this.timelineControllers(), 'pixelsPerDay', value);
    };
  };

  TimelineListController.prototype.scrollLeft = function(value) {
    var element = this.element();
    if (!element)
      return;
    if (typeof value === 'undefined')
      return element.scrollLeft;

    var timelineControllers = this.timelineControllers();
    element.scrollLeft = value;
    util.invoke(timelineControllers, 'scrollLeft', value);
  };

  TimelineListController.prototype.dispatchEvent = function(event) {
    var timelineControllers = this.timelineControllers();

    switch (event.type) {
    case 'init':
      this.element(event.element);
      this.oninit();
      break;
    case 'scroll':
      m.redraw.strategy('none');
      util.invoke(timelineControllers, 'scrollLeft', event.scrollLeft);
      this.onscroll(event);
      break;
    default:
      break;
    }
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = TimelineListController;
  else
    app.TimelineListController = TimelineListController;
})(this.app || (this.app = {}));