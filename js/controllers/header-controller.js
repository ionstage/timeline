(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var HeaderController = function() {
    var noop = function() {};
    this.daysAgo = m.prop(183);
    this.daysAfter = m.prop(183);
    this.pixelsPerDay = m.prop(8);
    this.timelineControllers = m.prop([]);
    this.showTimelinesPopover = m.prop(false);
    this.timelinesPopoverMode = m.prop(HeaderController.TIMELINES_POPOVER_MODE_INITIAL);
    this.onchange = noop;
    this.ontoday = noop;
    this.ontimelineadd = noop;
    this.ontimelineremove = noop;
  };

  HeaderController.prototype.dispatchEvent = function(event) {
    switch (event.type) {
    case 'change':
      this[event.name](event.value);
      this.onchange(event);
      break;
    case 'today':
      this.ontoday();
      break;
    case 'popovershow':
      if (this.showTimelinesPopover())
        break;
      this.showTimelinesPopover(true);
      m.redraw();
      break;
    case 'popoverhide':
      if (!this.showTimelinesPopover())
        break;
      this.showTimelinesPopover(false);
      m.redraw();
      break;
    case 'popovermodechange':
      this.timelinesPopoverMode(event.mode);
      break;
    case 'timelineadd':
      this.ontimelineadd(event);
      break;
    case 'timelineremove':
      this.ontimelineremove(event);
      break;
    default:
      break;
    }
  };

  HeaderController.TIMELINES_POPOVER_MODE_INITIAL = 'initial';
  HeaderController.TIMELINES_POPOVER_MODE_ADD = 'add';
  HeaderController.TIMELINES_POPOVER_MODE_EDIT = 'edit';

  app.HeaderController = HeaderController;
  global.app = app;
})(this);