(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;
  var util = global.util;

  var TimelineController = app.TimelineController;

  var kebabCase = util.kebabCase;
  var startOfDay = util.startOfDay;
  var loadData = util.loadData;
  var saveData = util.saveData;
  var windowWidth = util.windowWidth;

  var ActionController = function(option) {
    this.headerController = m.prop(option.headerController);
    this.timeAxisController = m.prop(option.timeAxisController);
    this.timelineListController = m.prop(option.timelineListController);
  };

  ActionController.prototype.start = function() {
    var headerController = this.headerController();
    var timeAxisController = this.timeAxisController();
    var timelineListController = this.timelineListController();

    var daysAgo = loadData('days-ago', 183);
    var daysAfter = loadData('days-after', 183);
    var pixelsPerDay = loadData('pixels-per-day' ,8);
    var timelineControllers = defaultTimelineListControllers({
      daysAgo: daysAgo,
      daysAfter: daysAfter,
      pixelsPerDay: pixelsPerDay
    });

    headerController.daysAgo(daysAgo);
    headerController.daysAfter(daysAfter);
    headerController.pixelsPerDay(pixelsPerDay);
    headerController.timelineControllers(timelineControllers);

    timeAxisController.daysAgo(daysAgo);
    timeAxisController.daysAfter(daysAfter);
    timeAxisController.pixelsPerDay(pixelsPerDay);

    timelineListController.timelineControllers(timelineControllers);

    headerController.onchange = onChangeHeaderController.bind(this);
    headerController.ontoday = onTodayHeaderController.bind(this);
    timelineListController.oninit = onInitTimelineListController.bind(this);
    timelineListController.onscroll = onScrollTimelineListController.bind(this);
  };

  var defaultTimelineListControllers = function(option) {
    var today = startOfDay();
    var year = today.getFullYear();
    var month = today.getMonth();

    return [
      new TimelineController({
        title: 'Line Chart',
        type: TimelineController.TYPE_LINE_CHART,
        data: [
          {date: new Date(year, month, 1), value: 500},
          {date: new Date(year, month, 5), value: 100},
          {date: new Date(year, month, 17), value: 2000},
          {date: new Date(year, month, 31), value: 700}
        ],
        daysAgo: option.daysAgo,
        daysAfter: option.daysAfter,
        pixelsPerDay: option.pixelsPerDay
      }),
      new TimelineController({
        title: 'Bar Chart',
        type: TimelineController.TYPE_BAR_CHART,
        data: [
          {date: new Date(year, month, 1), value: 100},
          {date: new Date(year, month, 2), value: 200},
          {date: new Date(year, month, 3), value: 500},
          {date: new Date(year, month, 8), value: 200}
        ],
        daysAgo: option.daysAgo,
        daysAfter: option.daysAfter,
        pixelsPerDay: option.pixelsPerDay
      }),
      new TimelineController({
        title: 'Schedule',
        type: TimelineController.TYPE_SCHEDULE,
        data: [
          {date: new Date(year, month - 1, 26), value: month + '/26 A', link: '#'},
          {date: new Date(year, month, 1), value: (month + 1) + '/1 B'},
          {date: new Date(year, month, 4), value: (month + 1) + '/4 C'},
          {date: new Date(year, month, 7), value: (month + 1) + '/7 D'},
          {date: new Date(year, month, 10), value: (month + 1) + '/10 E'},
          {date: new Date(year, month, 17), value: (month + 1) + '/17 F'},
          {date: new Date(year, month, 18), value: (month + 1) + '/18 G'},
          {date: new Date(year, month, 19), duration: 6, value: (month + 1) + '/19-24 H'},
          {date: new Date(year, month, 24), value: (month + 1) + '/24 I'},
          {date: new Date(year, month, 29), value: (month + 1) + '/29 J'}
        ],
        daysAgo: option.daysAgo,
        daysAfter: option.daysAfter,
        pixelsPerDay: option.pixelsPerDay
      }),
      new TimelineController({
        title: 'Gantt Chart',
        type: TimelineController.TYPE_GANTT_CHART,
        data: [
          {
            data: [
              {date: new Date(year, month, 16), duration: 5, value: 'a', color: 'pink'},
              {date: new Date(year, month, 21), duration: 3, value: 'b', color: 'gold'},
              {date: new Date(year, month, 24), duration: 3, value: 'c', color: 'lime'}
            ],
            deadline: new Date(year, month, 30),
            value: 'A',
            link: '#'
          },
          {
            data: [
              {date: new Date(year, month, 10), duration: 5, value: 'a'},
              {date: new Date(year, month, 15), duration: 3, value: 'b'},
              {date: new Date(year, month, 18), duration: 3, value: 'c'}
            ],
            value: 'B'
          },
          {
            data: [
              {date: new Date(year, month, 1), duration: 5, value: 'a'},
              {date: new Date(year, month, 6), duration: 3, value: 'b'},
              {date: new Date(year, month, 9), duration: 3, value: 'c'}
            ],
            value: 'C'
          },
          {
            data: [
              {date: new Date(year, month - 1, 21), duration: 5, value: 'a'},
              {date: new Date(year, month - 1, 26), duration: 3, value: 'b'},
              {date: new Date(year, month - 1, 29), duration: 3, value: 'c'}
            ],
            value: 'D'
          }
        ],
        daysAgo: option.daysAgo,
        daysAfter: option.daysAfter,
        pixelsPerDay: option.pixelsPerDay
      })
    ];
  };

  var updateScrollLeftPosition = function(ctrl, value) {
    var timelineListController = ctrl.timelineListController();

    // need only adjust timeline list scroll position
    // timeline list scroll event transferred to time axis
    timelineListController.scrollLeft(value);
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

    saveData(kebabCase(name), value);

    m.redraw();

    // adjust scroll position after redraw
    if (name === 'daysAgo') {
      scrollLeft += (value - daysAgo) * pixelsPerDay;
    } else if (name === 'pixelsPerDay') {
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