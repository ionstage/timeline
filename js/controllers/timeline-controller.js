(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;
  var util = global.util;

  var startOfDay = util.startOfDay;
  var translateX = util.translateX;

  var TimelineController = function(option) {
    this.url = m.prop(option.url);
    this.state = m.prop(TimelineController.STATE_INITIALIZED);
    this.title = m.prop('');
    this.type = m.prop(TimelineController.TYPE_NONE);
    this.data = m.prop([]);
    this.daysAgo = m.prop(183);
    this.daysAfter = m.prop(183);
    this.pixelsPerDay = m.prop(8);
    this.selectedIndex = selectedIndexProp();
    this.titleElement = m.prop(null);
  };

  TimelineController.prototype.fetch = function() {
    var url = this.url();

    var sampleUrlMatch = url.match(/timeline:sample\/(.+)/);
    var deferred = m.deferred();

    // make sample timeline data
    if (sampleUrlMatch) {
      var type = sampleUrlMatch[1];

      switch (type) {
      case TimelineController.TYPE_LINE_CHART:
        this.title('Line Chart');
        break;
      case TimelineController.TYPE_BAR_CHART:
        this.title('Bar Chart');
        break;
      case TimelineController.TYPE_SCHEDULE:
        this.title('Schedule');
        break;
      case TimelineController.TYPE_GANTT_CHART:
        this.title('Gantt Chart');
        break;
      default:
        deferred.reject(requestErrorCallback.call(this));
        return deferred.promise;
      }

      this.type(type);
      this.data(TimelineController.sampleData(type));
      this.state(TimelineController.STATE_LOAD_COMPLETE);

      deferred.resolve(this);
      return deferred.promise;
    }

    // load timeline data from web
    this.state(TimelineController.STATE_LOADING);
    try {
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
    } catch (e) {
      deferred.reject(requestErrorCallback.call(this));
      return deferred.promise;
    }
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

  TimelineController.sampleData = function(type) {
    var today = startOfDay();
    var year = today.getFullYear();
    var month = today.getMonth();

    switch (type) {
    case TimelineController.TYPE_LINE_CHART:
      return [
        {date: new Date(year, month, 1), value: 500},
        {date: new Date(year, month, 5), value: 100},
        {date: new Date(year, month, 17), value: 2000},
        {date: new Date(year, month, 31), value: 700}
      ];
    case TimelineController.TYPE_BAR_CHART:
      return [
        {date: new Date(year, month, 1), value: 100},
        {date: new Date(year, month, 2), value: 200},
        {date: new Date(year, month, 3), value: 500},
        {date: new Date(year, month, 8), value: 200}
      ];
    case TimelineController.TYPE_SCHEDULE:
      return [
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
      ];
    case TimelineController.TYPE_GANTT_CHART:
      return [
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
      ];
    default:
      return [];
    }
  };

  var selectedIndexProp = function() {
    var cacheProp = m.prop(null);
    return function(value) {
      if (typeof value === 'undefined') {
        value = cacheProp();
        var type = this.type();
        if (value === null)
          return (type === TimelineController.TYPE_GANTT_CHART) ? [-1, -1] : -1;
        else
          return value;
      }
      cacheProp(value);
    };
  };

  var requestSuccessCallback = function(result) {
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

  TimelineController.TYPE_NONE = 'none'
  TimelineController.TYPE_LINE_CHART = 'line-chart';
  TimelineController.TYPE_BAR_CHART = 'bar-chart';
  TimelineController.TYPE_SCHEDULE = 'schedule';
  TimelineController.TYPE_GANTT_CHART = 'gantt-chart';

  app.TimelineController = TimelineController;
  global.app = app;
})(this);