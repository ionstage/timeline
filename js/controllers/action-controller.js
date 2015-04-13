(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;
  var util = global.util;

  var TimelineController = app.TimelineController;

  var camelCase = util.camelCase;
  var loadData = util.loadData;
  var saveData = util.saveData;
  var windowWidth = util.windowWidth;

  var ActionController = function(option) {
    this.headerController = m.prop(option.headerController);
    this.timeAxisController = m.prop(option.timeAxisController);
    this.timelineListController = m.prop(option.timelineListController);
  };

  ActionController.prototype.timelineControllers = function(value) {
    var headerController = this.headerController();

    // headerController's timelineController is used as a cache
    if (typeof value === 'undefined')
      return headerController.timelineControllers();

    var timelineListController = this.timelineListController();

    headerController.timelineControllers(value);
    timelineListController.timelineControllers(value);
  };

  ActionController.prototype.start = function() {
    var headerController = this.headerController();
    var timeAxisController = this.timeAxisController();
    var timelineListController = this.timelineListController();

    var daysAgo = loadData('days-ago', 183);
    var daysAfter = loadData('days-after', 183);
    var pixelsPerDay = loadData('pixels-per-day' ,8);

    this.timelineControllers(defaultTimelineControllers({
      daysAgo: daysAgo,
      daysAfter: daysAfter,
      pixelsPerDay: pixelsPerDay
    }));

    headerController.daysAgo(daysAgo);
    headerController.daysAfter(daysAfter);
    headerController.pixelsPerDay(pixelsPerDay);

    timeAxisController.daysAgo(daysAgo);
    timeAxisController.daysAfter(daysAfter);
    timeAxisController.pixelsPerDay(pixelsPerDay);

    headerController.onchange = onChangeHeaderController.bind(this);
    headerController.ontoday = onTodayHeaderController.bind(this);
    headerController.ontimelineadd = onTimelineAddHeaderController.bind(this);
    headerController.ontimelineremove = onTimelineRemoveHeaderController.bind(this);
    headerController.ontimelinereorder = onTimelineReorderHeaderController.bind(this);
    timelineListController.oninit = onInitTimelineListController.bind(this);
    timelineListController.onscroll = onScrollTimelineListController.bind(this);
  };

  var defaultTimelineControllers = function(option) {
    return [];
  };

  var updateScrollLeftPosition = function(ctrl, value) {
    var timelineListController = ctrl.timelineListController();

    // need only adjust timeline list scroll position
    // timeline list scroll event transferred to time axis
    timelineListController.scrollLeft(value);
  };

  var addTimelineController = function(ctrl, url) {
    var headerController = ctrl.headerController();
    var controllers = ctrl.timelineControllers();

    var timelineController = new TimelineController({
      url: url
    });

    controllers.push(timelineController);

    timelineController.fetch().then(function(controller) {
      controller.daysAgo(headerController.daysAgo());
      controller.daysAfter(headerController.daysAfter());
      controller.pixelsPerDay(headerController.pixelsPerDay());
      m.redraw();
    });

    m.redraw();
  };

  var removeTimelineController = function(ctrl, index) {
    var controllers = ctrl.timelineControllers();
    controllers.splice(index, 1);
    m.redraw();
  };

  var reorderTimelineController = function(ctrl, indeces) {
    var controllers = ctrl.timelineControllers();
    var clone = controllers.concat();

    for (var i = 0, len = controllers.length; i < len; i++) {
      controllers[i] = clone[indeces[i]];
    }

    m.redraw();
  };

  var onChangeHeaderController = function(event) {
    var timeAxisController = this.timeAxisController();
    var timelineListController = this.timelineListController();

    // get values before change
    var daysAgo = timeAxisController.daysAgo();
    var pixelsPerDay = timeAxisController.pixelsPerDay();
    var scrollLeft = timelineListController.scrollLeft();

    var name = event.name;
    var value = event.value;
    var methodName = camelCase(name);

    timeAxisController[methodName](value);
    timelineListController[methodName](value);

    saveData(name, value);

    m.redraw();

    // adjust scroll position after redraw
    if (name === 'days-ago') {
      scrollLeft += (value - daysAgo) * pixelsPerDay;
    } else if (name === 'pixels-per-day') {
      var scrollDays = (scrollLeft + windowWidth() / 2) / pixelsPerDay;
      scrollLeft += scrollDays * (value - pixelsPerDay);
    }

    updateScrollLeftPosition(this, scrollLeft);
  };

  var onTodayHeaderController = function() {
    var headerController = this.headerController();

    var daysAgo = headerController.daysAgo();
    var pixelsPerDay = headerController.pixelsPerDay();
    var scrollLeft = (daysAgo + 0.5) * pixelsPerDay - windowWidth() / 2;

    updateScrollLeftPosition(this, scrollLeft);
  };

  var onTimelineAddHeaderController = function(event) {
    var url = event.url;
    if (!url)
      return;
    addTimelineController(this, url);
  };

  var onTimelineRemoveHeaderController = function(event) {
    removeTimelineController(this, event.index);
  };

  var onTimelineReorderHeaderController = function(event) {
    reorderTimelineController(this, event.indeces);
  };

  var onInitTimelineListController = function() {
    onTodayHeaderController.call(this);
  };

  var onScrollTimelineListController = function(event) {
    var timeAxisController = this.timeAxisController();
    timeAxisController.scrollLeft(event.scrollLeft);
  };

  app.ActionController = ActionController;
  global.app = app;
})(this);