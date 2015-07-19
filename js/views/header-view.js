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
        m('div.icon.rotate-90', ['I']),
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
        m('div.icon.antialias', ['||||']),
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
        m('div.icon.antialias', ['| |'])
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
    var visibleTimelineControllers = timelineControllers.filter(function(controller) {
      return controller.visible();
    });
    var showTimelinesPopover = ctrl.showTimelinesPopover();
    var timelinesPopoverMode = ctrl.timelinesPopoverMode();

    var height, view;
    var maxHeight = util.windowHeight() - 72;

    if (timelinesPopoverMode === HeaderController.TIMELINES_POPOVER_MODE_EDIT) {
      height = Math.min(timelineControllers.length * 41 + 90, maxHeight);
      view = popoverEditView;
    } else {
      height = Math.min(visibleTimelineControllers.length * 41 + 90, maxHeight);
      view = popoverInitialView;
    }

    return m('div.popover', {
      className: showTimelinesPopover ? '' : 'invisible',
      style: 'height: ' + height +'px;',
      config: function(element, isInitialized) {
        if (isInitialized)
          return;
        element.addEventListener(util.supportsTouch() ? 'touchstart' : 'mousedown', function(event) {
          event.stopPropagation();
        });
        util.rootElement().addEventListener(util.supportsTouch() ? 'touchstart' : 'mousedown', function() {
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
    return [
      m('div.popover-header', [
        m('a.button.invisible'),
        m('div.spacer.antialias', 'Timelines'),
        m('a.button.antialias', {
          href: '#',
          onclick: function() {
            ctrl.dispatchEvent({
              type: 'timelinereorder',
              indeces: indecesOnEditTimelines(timelineControllers)
            });
            ctrl.dispatchEvent({
              type: 'popovermodechange',
              mode: HeaderController.TIMELINES_POPOVER_MODE_EDIT
            });
          }
        }, 'Edit')
      ]),
      m('div.popover-content', [
        m('div.popover-list', {
          config: function(element, isInitialized) {
            if (isInitialized)
              return;
            var $sortable = util.sortable(element, {
              axis: 'y',
              containment: 'parent',
              handle: '.popover-list-item-handle',
              tolerance: 'pointer',
              stop: function() {
                var sortedClassNames = $sortable.sortable('toArray', {attribute: 'class'});
                var indeces = sortedClassNames.map(function(className) {
                  return +className.match(/index-(\d+)/)[1];
                });

                // add indeces of invisible timelines
                for (var i = 0, len = timelineControllers.length; i < len; i++) {
                  if (indeces.indexOf(i) === -1)
                    indeces.push(i);
                }

                // cancel sort for using virtual DOM update
                $sortable.sortable('cancel');

                ctrl.dispatchEvent({
                  type: 'timelinereorder',
                  indeces: indeces
                });
              }
            });
          }
        }, timelineControllers.map(function(controller, index) {
          if (!controller.visible())
            return;

          var state = controller.state();
          var title = controller.title();
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
            m('div.popover-list-item-handle.rotate-90', '|||')
          ]);
        }))
      ])
    ];
  };

  var popoverEditView = function(ctrl) {
    var timelineControllers = ctrl.timelineControllers();
    return [
      m('div.popover-header', [
        m('a.button.invisible'),
        m('div.spacer.antialias', 'Edit Timelines'),
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
        }, timelineControllers.map(function(controller, index) {
          var state = controller.state();
          var title = controller.title();
          var visible = controller.visible();
          var className = '';
          if (state === TimelineController.STATE_LOADING)
            className = 'loading';
          else if (state === TimelineController.STATE_LOAD_ERROR)
            className = 'load-error';
          return m('div.popover-list-item.edit', {
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

  var indecesOnEditTimelines = function(timelineControllers) {
    var visibleIndeces = [];
    var invisibleIndeces = [];

    // devide timelines into visible or not
    timelineControllers.forEach(function(controller, index) {
      if (controller.visible())
        visibleIndeces.push(index);
      else
        invisibleIndeces.push(index);
    });

    // sort invisible timelines by title
    invisibleIndeces.sort(function(i, j) {
      if (timelineControllers[i].title() < timelineControllers[j].title())
        return -1;
      else
        return 1;
    });

    return visibleIndeces.concat(invisibleIndeces);
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = headerView;
  else
    app.headerView = headerView;
})(this.app || (this.app = {}));