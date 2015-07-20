(function(app) {
  'use strict';
  var m = require('mithril');
  var util = app.util || require('../util.js');

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
    this.ontimelinetoggle = noop;
    this.ontimelinereorder = noop;
  };

  HeaderController.prototype.dispatchEvent = function(event) {
    switch (event.type) {
    case 'change':
      this[util.camelCase(event.name)](event.value);
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
    case 'timelinetoggle':
      this.ontimelinetoggle(event);
      break;
    case 'timelinereorder':
      this.ontimelinereorder(event);
      break;
    default:
      break;
    }
  };

  HeaderController.TIMELINES_POPOVER_MODE_INITIAL = 'initial';
  HeaderController.TIMELINES_POPOVER_MODE_SELECT = 'select';

  if (typeof module !== 'undefined' && module.exports)
    module.exports = HeaderController;
  else
    app.HeaderController = HeaderController;
})(this.app || (this.app = {}));