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

    headerController.onchange = onChangeHeaderController.bind(this);
  };

  var onChangeHeaderController = function(event) {
    var timeAxisController = this.timeAxisController();
    var timelineListController = this.timelineListController();

    var name = event.name;
    var value = event.value;

    timeAxisController[name](value);
    timelineListController[name](value);
  };

  app.ActionController = ActionController;
  global.app = app;
})(this);