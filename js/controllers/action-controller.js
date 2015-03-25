(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;
  var util = global.util;

  var LineChartTimelineController = app.LineChartTimelineController;

  var windowWidth = util.windowWidth;

  var ActionController = function(option) {
    this.headerController = m.prop(option.headerController);
    this.timeAxisController = m.prop(option.timeAxisController);
    this.timelineListController = m.prop(option.timelineListController);
  };

  ActionController.prototype.start = function() {
    var headerController = this.headerController();
    var timelineListController = this.timelineListController();

    timelineListController.timelineControllers(defaultTimelineListControllers({
      daysAgo: headerController.daysAgo(),
      daysAfter: headerController.daysAfter(),
      pixelsPerDay: headerController.pixelsPerDay()
    }));

    headerController.onchange = onChangeHeaderController.bind(this);
    timelineListController.onscroll = onScrollTimelineListController.bind(this);
  };

  var defaultTimelineListControllers = function(option) {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();

    return [
      new LineChartTimelineController({
        title: 'Line Chart',
        data: [
          {'date': new Date(year, month, 1), 'value': 500},
          {'date': new Date(year, month, 5), 'value': 100},
          {'date': new Date(year, month, 17), 'value': 2000},
          {'date': new Date(year, month, 31), 'value': 700}
        ],
        daysAgo: option.daysAgo,
        daysAfter: option.daysAfter,
        pixelsPerDay: option.pixelsPerDay
      })
    ];
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

    timeAxisController[name](value);
    timelineListController[name](value);

    m.redraw();

    // adjust scroll position after redraw
    if (name === 'daysAgo') {
      scrollLeft += (value - daysAgo) * pixelsPerDay;
    } else if (name === 'pixelsPerDay') {
      var scrollDays = (scrollLeft + windowWidth() / 2) / pixelsPerDay;
      scrollLeft += scrollDays * (value - pixelsPerDay);
    }

    // need only adjust timeline list scroll position
    // timeline list scroll event transferred to time axis
    timelineListController.scrollLeft(scrollLeft);
  };

  var onScrollTimelineListController = function(event) {
    var timeAxisController = this.timeAxisController();
    timeAxisController.scrollLeft(event.scrollLeft);
  };

  app.ActionController = ActionController;
  global.app = app;
})(this);