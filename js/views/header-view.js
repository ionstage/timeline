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
    var showTimelinesPopover = ctrl.showTimelinesPopover();
    var timelinesPopoverMode = ctrl.timelinesPopoverMode();

    var height, view;
    var maxHeight = util.windowHeight() - 72;

    if (timelinesPopoverMode === HeaderController.TIMELINES_POPOVER_MODE_ADD) {
      height = 160;
      view = popoverAddView;
    } else if (timelinesPopoverMode === HeaderController.TIMELINES_POPOVER_MODE_EDIT) {
      height = Math.min(timelineControllers.length * 41 + 90, maxHeight);
      view = popoverEditView;
    } else {
      height = Math.min(timelineControllers.length * 41 + 90, maxHeight);
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
        m('a.button.antialias', {
          href: '#',
          onclick: function() {
            ctrl.dispatchEvent({
              type: 'popovermodechange',
              mode: HeaderController.TIMELINES_POPOVER_MODE_ADD
            });
          }
        }, 'Add'),
        m('div.spacer.antialias', 'Timelines'),
        m('a.button.antialias', {
          href: '#',
          onclick: function() {
            ctrl.dispatchEvent({
              type: 'popovermodechange',
              mode: HeaderController.TIMELINES_POPOVER_MODE_EDIT
            });
          }
        }, 'Edit')
      ]),
      m('div.popover-content', [
        m('div.popover-list', timelineControllers.map(function(controller) {
          var state = controller.state();
          var title = controller.title();
          var className = '';
          if (state === TimelineController.STATE_LOADING)
            className = 'loading';
          else if (state === TimelineController.STATE_LOAD_ERROR)
            className = 'load-error';
          return m('div.popover-list-item', {
            className: className
          }, [
            m('div.popover-list-item-title', [
              m('div.text.initial.antialias', title)
            ])
          ]);
        }))
      ])
    ];
  };

  var popoverAddView = function(ctrl) {
    var inputElementProp = m.prop(null);
    return [
      m('div.popover-header', [
        m('a.button.antialias', {
          href: '#',
          onclick: function() {
            ctrl.dispatchEvent({
              type: 'popovermodechange',
              mode: HeaderController.TIMELINES_POPOVER_MODE_INITIAL
            });
          }
        }, 'Cencel'),
        m('div.spacer.antialias', 'Add Timeline'),
        m('a.button.done.antialias', {
          href: '#',
          config: function(element, isInitialized) {
            if (isInitialized)
              return;
            var prop = inputElementProp;
            element.addEventListener('click', function() {
              var inputElement = prop();
              if (!inputElement)
                return;
              ctrl.dispatchEvent({
                type: 'popovermodechange',
                mode: HeaderController.TIMELINES_POPOVER_MODE_INITIAL
              });
              m.redraw();
              ctrl.dispatchEvent({
                type: 'timelineadd',
                url: inputElement.value
              });
            });
          }
        }, 'Done')
      ]),
      m('div.popover-content', [
        m('div.antialias', 'URL'),
        m('input', {
          type: 'url',
          autofocus: true,
          config: function(element, isInitialized) {
            if (isInitialized)
              return;
            inputElementProp(element);
          }
        }, 'URL')
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
            var target = event.target;
            var className = target.getAttribute('class');

            m.redraw.strategy('none');

            if (!className || !className.match(/popover-list-item-button/))
              return;

            var index = +className.match(/index-(\d+)/)[1];
            ctrl.dispatchEvent({
              type: 'timelineremove',
              index: index
            });
          },
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
            m('a.popover-list-item-button.antialias', {
              className: 'index-' + index,
              href: '#'
            }, '×'),
            m('div.popover-list-item-title', [
              m('div.text.edit.antialias', title)
            ]),
            m('div.popover-list-item-handle.rotate-90', '|||')
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

  if (typeof module !== 'undefined' && module.exports)
    module.exports = headerView;
  else
    app.headerView = headerView;
})(this.app || (this.app = {}));