(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var LineChartTimelineController = app.LineChartTimelineController;

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

    var name = event.name;
    var value = event.value;

    timeAxisController[name](value);
    timelineListController[name](value);
  };

  var onScrollTimelineListController = function(event) {
    var timeAxisController = this.timeAxisController();
    timeAxisController.scrollLeft(event.scrollLeft);
  };

  app.ActionController = ActionController;
  global.app = app;
})(this);