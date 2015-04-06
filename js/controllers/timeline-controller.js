(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;
  var util = global.util;

  var translate = util.translate;

  var TimelineController = function(option) {
    this.title = m.prop(option.title);
    this.type = m.prop(option.type);
    this.data = m.prop(option.data);
    this.daysAgo = m.prop(option.daysAgo);
    this.daysAfter = m.prop(option.daysAfter);
    this.pixelsPerDay = m.prop(option.pixelsPerDay);
    this.selectedIndex = selectedIndexProp();
    this.titleElement = m.prop(null);
  };

  TimelineController.prototype.scrollLeft = function(value) {
    var titleElement = this.titleElement();
    if (titleElement)
      translate(titleElement, value, 0);
  };

  TimelineController.prototype.dispatchEvent = function(event) {
    switch (event.type) {
    case 'init':
      this.titleElement(event.titleElement);
      break;
    case 'select':
      this.selectedIndex(event.selectedIndex);
      break;
    default:
      break;
    }
  };

  var selectedIndexProp = function() {
    var selectedIndex = m.prop(null);
    return function(value) {
      if (typeof value === 'undefined') {
        value = selectedIndex();
        var type = this.type();
        if (value === null)
          return (type === TimelineController.TYPE_GANTT_CHART) ? [-1, -1] : -1;
        else
          return value;
      }
      selectedIndex(value);
    };
  };

  TimelineController.TYPE_LINE_CHART = 'line-chart';
  TimelineController.TYPE_BAR_CHART = 'bar-chart';
  TimelineController.TYPE_SCHEDULE = 'schedule';
  TimelineController.TYPE_GANTT_CHART = 'gantt-chart';

  app.TimelineController = TimelineController;
  global.app = app;
})(this);