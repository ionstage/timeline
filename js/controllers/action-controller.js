(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var ActionController = function(option) {
    this.headerController = m.prop(option.headerController);
    this.timeAxisController = m.prop(option.timeAxisController);
    this.timelineListController = m.prop(option.timelineListController);
  };

  ActionController.prototype.start = function() {
    var headerController = this.headerController();
    var timelineListController = this.timelineListController();

    headerController.onchange = onChangeHeaderController.bind(this);
    timelineListController.onscroll = onScrollTimelineListController.bind(this);
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