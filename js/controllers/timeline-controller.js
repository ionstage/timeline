(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;
  var util = global.util;

  var translateX = util.translateX;

  var TimelineController = function(option) {
    this.url = m.prop(option.url);
    this.state = m.prop(TimelineController.STATE_INITIALIZED);
    this.title = m.prop(option.title);
    this.type = m.prop(option.type);
    this.data = m.prop(option.data);
    this.daysAgo = m.prop(option.daysAgo);
    this.daysAfter = m.prop(option.daysAfter);
    this.pixelsPerDay = m.prop(option.pixelsPerDay);
    this.selectedIndex = selectedIndexProp();
    this.titleElement = m.prop(null);
  };

  TimelineController.prototype.fetch = function() {
    var url = this.url();
    this.state(TimelineController.STATE_LOADING);
    return m.request({
      method: 'GET',
      url: url,
      deserialize: function(value) {
        try {
          return JSON.parse(value);
        } catch (e) {
          return null;
        }
      }
    }).then(requestSuccessCallback.bind(this), requestErrorCallback.bind(this));
  };

  TimelineController.prototype.scrollLeft = function(value) {
    var titleElement = this.titleElement();
    if (titleElement)
      translateX(titleElement, value);
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

  var requestSuccessCallback = function(result) {
    if (!result)
      return requestErrorCallback.call(this);

    var title = result.title;
    var type = result.type;
    var data = result.data;

    if (type === TimelineController.TYPE_GANTT_CHART) {
      data = data.map(function(item) {
        item.data = parseDateProperty(item.data);
        item.deadline = new Date(item.deadline);
        return item;
      });
    } else {
      data = parseDateProperty(data);
    }

    this.title(title);
    this.type(type);
    this.data(data);
    this.state(TimelineController.STATE_LOAD_COMPLETE);
    return this;
  };

  var requestErrorCallback = function() {
    this.state(TimelineController.STATE_LOAD_ERROR);
    return this;
  };

  var parseDateProperty = function(array) {
    return array.map(function(item) {
      item.date = new Date(item.date);
      return item;
    });
  };

  TimelineController.STATE_INITIALIZED = 'initialized';
  TimelineController.STATE_LOADING = 'loading';
  TimelineController.STATE_LOAD_COMPLETE = 'load-complete';
  TimelineController.STATE_LOAD_ERROR = 'load-error';

  TimelineController.TYPE_LINE_CHART = 'line-chart';
  TimelineController.TYPE_BAR_CHART = 'bar-chart';
  TimelineController.TYPE_SCHEDULE = 'schedule';
  TimelineController.TYPE_GANTT_CHART = 'gantt-chart';

  app.TimelineController = TimelineController;
  global.app = app;
})(this);