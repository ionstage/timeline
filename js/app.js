(function(app) {
  'use strict';
  var m = require('mithril');
  var util = app.util || require('./util.js');
  var HeaderController = app.HeaderController || require('./controllers/header-controller.js');
  var TimeAxisController = app.TimeAxisController || require('./controllers/time-axis-controller.js');
  var TimelineListController = app.TimelineListController || require('./controllers/timeline-list-controller.js');
  var ActionController = app.ActionController || require('./controllers/action-controller.js');
  var headerView = app.headerView || require('./views/header-view.js');
  var timeAxisView = app.timeAxisView || require('./views/time-axis-view.js');
  var timelineListView = app.timelineListView || require('./views/timeline-list-view.js');

  var controller = function() {
    this.headerController = new HeaderController();
    this.timeAxisController = new TimeAxisController();
    this.timelineListController = new TimelineListController();
    new ActionController({
      headerController: this.headerController,
      timeAxisController: this.timeAxisController,
      timelineListController: this.timelineListController
    }).start();
  };

  var view = function(ctrl) {
    return [
      headerView(ctrl.headerController),
      timeAxisView(ctrl.timeAxisController),
      timelineListView(ctrl.timelineListController)
    ];
  };

  m.module(util.el('#container'), {
    controller: controller,
    view: view
  });
})(this.app || (this.app = {}));