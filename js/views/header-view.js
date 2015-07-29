(function(app) {
  'use strict';
  var m = require('mithril');
  var util = app.util || require('../util.js');
  var HeaderController = app.HeaderController || require('../controllers/header-controller.js');
  var TimelineController = app.TimelineController || require('../controllers/timeline-controller.js');

  var headerView = function(ctrl) {
    var daysAgo = ctrl.daysAgo();
    var daysAfter = ctrl.daysAfter();
    var pixelsPerDay = ctrl.pixelsPerDay();
    var timelineControllers = ctrl.timelineControllers();

    return m('div.header.unselectable', [
      m('div.time-span', [
        m('select', {
          onchange: m.withAttr('value', function(value) {
            ctrl.dispatchEvent({
              type: 'change',
              name: 'days-ago',
              value: +value
            });
          }),
          value: daysAgo.toString()
        },[
          m('option', {value: '183'}, ['6 months ago']),
          m('option', {value: '365'}, ['1 year ago']),
          m('option', {value: '730'}, ['2 year ago'])
        ]),
        m('div.icon.range.rotate-90'),
        m('select', {
          onchange: m.withAttr('value', function(value) {
            ctrl.dispatchEvent({
              type: 'change',
              name: 'days-after',
              value: +value
            });
          }),
          value: daysAfter.toString()
        }, [
          m('option', {value: '183'}, ['6 months after']),
          m('option', {value: '365'}, ['1 year after']),
          m('option', {value: '730'}, ['2 year after'])
        ])
      ]),
      m('div.pixels-per-day', [
        m('div.icon.small.antialias'),
        m('input', {
          type: 'range',
          min: '1.5',
          max: '30',
          step: '0.5',
          onchange: m.withAttr('value', function(value) {
            ctrl.dispatchEvent({
              type: 'change',
              name: 'pixels-per-day',
              value: +value
            });
          }),
          value: pixelsPerDay.toString()
        }),
        m('div.icon.large.antialias')
      ]),
      m('div.spacer'),
      m('a.button.antialias', {
        href: '#',
        onclick: function() {
          ctrl.dispatchEvent({
            type: 'today'
          });
        }
      }, 'Today'),
      m('a.button.antialias', {
        className: ctrl.showTimelinesPopover() ? 'disabled' : '',
        href: '#',
        onclick: function() {
          m.redraw.strategy('none');
          ctrl.dispatchEvent({
            type: 'popovershow'
          });
        }
      }, 'Timelines'),
      popoverView(ctrl)
    ]);
  };

  var popoverView = function(ctrl) {
    var timelineControllers = ctrl.timelineControllers();
    var visibleTimelineControllers = timelineControllers.filter(function(timelineController) {
      return timelineController.visible();
    });
    var showTimelinesPopover = ctrl.showTimelinesPopover();
    var timelinesPopoverMode = ctrl.timelinesPopoverMode();

    var padding, height, view;
    var maxHeight = util.windowHeight() - 72;

    if (timelinesPopoverMode === HeaderController.TIMELINES_POPOVER_MODE_SELECT) {
      padding = timelineControllers.length > 0 ? 90 : 108;
      height = Math.min(timelineControllers.length * 42 + padding, maxHeight);
      view = popoverSelectView;
    } else {
      padding = visibleTimelineControllers.length > 0 ? 90 : 108;
      height = Math.min(visibleTimelineControllers.length * 42 + padding, maxHeight);
      view = popoverInitialView;
    }

    return m('div.popover', {
      className: showTimelinesPopover ? '' : 'invisible',
      style: {height: height + 'px'},
      config: function(element, isInitialized) {
        if (isInitialized)
          return;
        element.addEventListener(util.supportsTouch() ? 'touchstart' : 'mousedown', function(event) {
          event.stopPropagation();
        });
        util.rootElement().addEventListener(util.supportsTouch() ? 'touchstart' : 'mousedown', function(event) {
          if (util.supportsTouch() && util.hasClass(event.target, 'header'))
            event.preventDefault();
          hidePopoverView(ctrl);
        });
        util.addResizeEvent(function() {
          hidePopoverView(ctrl);
        });
      }
    }, view(ctrl));
  };

  var popoverInitialView = function(ctrl) {
    var timelineControllers = ctrl.timelineControllers();
    var visibleTimelineControllers = timelineControllers.filter(function(timelineController) {
      return timelineController.visible();
    });

    return [
      m('div.popover-header', [
        m('a.button.invisible'),
        m('div.spacer.antialias', 'Timelines'),
        m('a.button.antialias', {
          href: '#',
          onclick: function() {
            ctrl.dispatchEvent({
              type: 'timelinereorder',
              indices: indicesOnSelectTimelines(timelineControllers)
            });
            ctrl.dispatchEvent({
              type: 'popovermodechange',
              mode: HeaderController.TIMELINES_POPOVER_MODE_SELECT
            });
          }
        }, 'Select')
      ]),
      m('div.popover-content', [
        m('div.popover-list', {
          className: visibleTimelineControllers.length === 0 ? 'empty' : '',
          config: function(element, isInitialized) {
            if (isInitialized)
              return;
            var $sortable = util.sortable(element, {
              axis: 'y',
              containment: 'parent',
              handle: '.popover-list-item-handle',
              tolerance: 'pointer',
              stop: function() {
                var timelineControllers = ctrl.timelineControllers();
                var sortedClassNames = $sortable.sortable('toArray', {attribute: 'class'});
                var indices = sortedClassNames.map(function(className) {
                  return +className.match(/index-(\d+)/)[1];
                });

                // add indices of invisible timelines
                for (var i = 0, len = timelineControllers.length; i < len; i++) {
                  if (indices.indexOf(i) === -1)
                    indices.push(i);
                }

                // cancel sort for using virtual DOM update
                $sortable.sortable('cancel');

                ctrl.dispatchEvent({
                  type: 'timelinereorder',
                  indices: indices
                });
              }
            });
          }
        }, timelineControllers.map(function(timelineController, index) {
          if (!timelineController.visible())
            return;

          var state = timelineController.state();
          var title = timelineController.title();
          var className = '';
          if (state === TimelineController.STATE_LOADING)
            className = 'loading';
          else if (state === TimelineController.STATE_LOAD_ERROR)
            className = 'load-error';
          return m('div.popover-list-item', {
            className: className + ' index-' + index
          }, [
            m('div.popover-list-item-title', [
              m('div.text.antialias', title)
            ]),
            m('div.popover-list-item-handle.rotate-90')
          ]);
        }))
      ])
    ];
  };

  var popoverSelectView = function(ctrl) {
    var timelineControllers = ctrl.timelineControllers();
    return [
      m('div.popover-header', [
        m('a.button.invisible'),
        m('div.spacer.antialias', 'Select Timelines'),
        m('a.button.done.antialias', {
          href: '#',
          onclick: function() {
            ctrl.dispatchEvent({
              type: 'popovermodechange',
              mode: HeaderController.TIMELINES_POPOVER_MODE_INITIAL
            });
          }
        }, 'Done')
      ]),
      m('div.popover-content', [
        m('div.popover-list', {
          className: timelineControllers.length === 0 ? 'empty' : '',
          onclick: function(event) {
            var target = util.closest(event.target, '.popover-list-item');
            if (!target)
              return;

            m.redraw.strategy('none');

            var className = target.getAttribute('class');
            var index = +className.match(/index-(\d+)/)[1];
            ctrl.dispatchEvent({
              type: 'timelinetoggle',
              index: index
            });
          }
        }, timelineControllers.map(function(timelineController, index) {
          var state = timelineController.state();
          var title = timelineController.title();
          var visible = timelineController.visible();
          var className = '';
          if (state === TimelineController.STATE_LOADING)
            className = 'loading';
          else if (state === TimelineController.STATE_LOAD_ERROR)
            className = 'load-error';
          return m('div.popover-list-item.select', {
            className: className + ' index-' + index
          }, [
            m('div.popover-list-item-icon.antialias', visible ? '✓' : ''),
            m('div.popover-list-item-title', [
              m('div.text.antialias', title)
            ])
          ]);
        }))
      ])
    ];
  };

  var hidePopoverView = function(ctrl) {
    ctrl.dispatchEvent({
      type: 'popoverhide'
    });
    ctrl.dispatchEvent({
      type: 'popovermodechange',
      mode: HeaderController.TIMELINES_POPOVER_MODE_INITIAL
    });
  };

  var indicesOnSelectTimelines = function(timelineControllers) {
    var visibleIndices = [];
    var invisibleIndices = [];

    // devide timelines into visible or not
    timelineControllers.forEach(function(timelineController, index) {
      if (timelineController.visible())
        visibleIndices.push(index);
      else
        invisibleIndices.push(index);
    });

    // sort invisible timelines by title
    invisibleIndices.sort(function(i, j) {
      if (timelineControllers[i].title() < timelineControllers[j].title())
        return -1;
      else
        return 1;
    });

    return visibleIndices.concat(invisibleIndices);
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = headerView;
  else
    app.headerView = headerView;
})(this.app || (this.app = {}));