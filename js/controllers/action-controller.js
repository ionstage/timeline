(function(app) {
  'use strict';
  var m = require('mithril');
  var util = app.util || require('../util.js');
  var TimelineController = app.TimelineController || require('./timeline-controller.js');

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

    var daysAgo = util.loadData('days-ago', 183);
    var daysAfter = util.loadData('days-after', 183);
    var pixelsPerDay = util.loadData('pixels-per-day' ,8);

    loadDefaultTimelineControllers(this, {
      daysAgo: daysAgo,
      daysAfter: daysAfter,
      pixelsPerDay: pixelsPerDay
    });

    updateTimelineSettings(headerController, daysAgo, daysAfter, pixelsPerDay);
    updateTimelineSettings(timeAxisController, daysAgo, daysAfter, pixelsPerDay);
    updateTimelineSettings(timelineListController, daysAgo, daysAfter, pixelsPerDay);

    headerController.onchange = onChangeHeaderController.bind(this);
    headerController.ontoday = onTodayHeaderController.bind(this);
    headerController.ontimelinetoggle = onTimelineToggleHeaderController.bind(this);
    headerController.ontimelinereorder = onTimelineReorderHeaderController.bind(this);
    timelineListController.oninit = onInitTimelineListController.bind(this);
    timelineListController.onscroll = onScrollTimelineListController.bind(this);
  };

  var updateTimelineSettings = function(ctrl, daysAgo, daysAfter, pixelsPerDay) {
    ctrl.daysAgo(daysAgo);
    ctrl.daysAfter(daysAfter);
    ctrl.pixelsPerDay(pixelsPerDay);
  };

  var loadDefaultTimelineControllers = function(ctrl, option) {
    var urls = loadTimelineUrls();

    if (urls === null) {
      // load default timeline URLs from settings
      util.getJSON('settings.json').done(function(data) {
        var defaultTimelines = data.defaultTimelines;
        if (Array.isArray(defaultTimelines)) {
          util.saveData('timeline-urls', defaultTimelines);
          loadDefaultTimelineControllers(ctrl, option);
        }
      });
      return;
    }

    var timelineControllers = urls.map(function(url) {
      return new TimelineController({
        url: url
      });
    });

    m.sync(timelineControllers.map(function(timelineController) {
      return timelineController.fetch();
    })).then(function(timelineControllers) {
      var timelineListController = ctrl.timelineListController();
      var daysAgo = option.daysAgo;
      var daysAfter = option.daysAfter;
      var pixelsPerDay = option.pixelsPerDay;

      ctrl.timelineControllers(timelineControllers);
      updateTimelineSettings(timelineListController, daysAgo, daysAfter, pixelsPerDay);
      m.redraw();

      updateScrollLeftPosition(ctrl);
    });
  };

  var updateScrollLeftPosition = function(ctrl, value) {
    var timelineListController = ctrl.timelineListController();

    // locate each timeline title
    if (typeof value === 'undefined')
      value = timelineListController.scrollLeft();

    // need only adjust timeline list scroll position
    // timeline list scroll event transferred to time axis
    timelineListController.scrollLeft(value);
  };

  var toggleTimelineController = function(ctrl, index) {
    var timelineControllers = ctrl.timelineControllers();
    var timelineController = timelineControllers[index];

    timelineController.toggle();
    m.redraw();

    updateScrollLeftPosition(ctrl);
  };

  var reorderTimelineController = function(ctrl, indices) {
    var timelineControllers = ctrl.timelineControllers();
    var clone = timelineControllers.concat();

    for (var i = 0, len = timelineControllers.length; i < len; i++) {
      timelineControllers[i] = clone[indices[i]];
    }

    saveTimelineUrls(timelineControllers);
    m.redraw();

    updateScrollLeftPosition(ctrl);
  };

  var loadTimelineUrls = function() {
    return util.loadData('timeline-urls', null);
  };

  var saveTimelineUrls = function(timelineControllers) {
    util.saveData('timeline-urls', timelineControllers.map(function(timelineController) {
      return timelineController.url();
    }));
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
    var methodName = util.camelCase(name);

    timeAxisController[methodName](value);
    timelineListController[methodName](value);

    util.saveData(name, value);
    m.redraw();

    // adjust scroll position after redraw
    if (name === 'days-ago') {
      scrollLeft += (value - daysAgo) * pixelsPerDay;
    } else if (name === 'pixels-per-day') {
      var scrollDays = (scrollLeft + util.windowWidth() / 2) / pixelsPerDay;
      scrollLeft += scrollDays * (value - pixelsPerDay);
    }

    updateScrollLeftPosition(this, scrollLeft);
  };

  var onTodayHeaderController = function() {
    var headerController = this.headerController();

    var daysAgo = headerController.daysAgo();
    var pixelsPerDay = headerController.pixelsPerDay();
    var scrollLeft = (daysAgo + 0.5) * pixelsPerDay - util.windowWidth() / 2;

    updateScrollLeftPosition(this, scrollLeft);
  };

  var onTimelineToggleHeaderController = function(event) {
    toggleTimelineController(this, event.index);
  };

  var onTimelineReorderHeaderController = function(event) {
    reorderTimelineController(this, event.indices);
  };

  var onInitTimelineListController = function() {
    onTodayHeaderController.call(this);
  };

  var onScrollTimelineListController = function(event) {
    var timeAxisController = this.timeAxisController();
    timeAxisController.scrollLeft(event.scrollLeft);
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = ActionController;
  else
    app.ActionController = ActionController;
})(this.app || (this.app = {}));