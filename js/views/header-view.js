(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;
  var util = global.util;

  var HeaderController = app.HeaderController;
  var TimelineController = app.TimelineController;

  var supportsTouch = util.supportsTouch;
  var rootElement = util.rootElement;
  var sortable = util.sortable;

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
        m('div.icon', ['I']),
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
        m('div.icon', ['||||']),
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
        m('div.icon', ['| |'])
      ]),
      m('div.spacer'),
      m('a.button', {
        href: '#',
        onclick: function() {
          ctrl.dispatchEvent({
            type: 'today'
          });
        }
      }, 'Today'),
      m('a.button', {
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

    if (timelinesPopoverMode === HeaderController.TIMELINES_POPOVER_MODE_ADD) {
      height = 160;
      view = popoverAddView;
    } else if (timelinesPopoverMode === HeaderController.TIMELINES_POPOVER_MODE_EDIT) {
      height = timelineControllers.length * 42 + 90;
      view = popoverEditView;
    } else {
      height = timelineControllers.length * 42 + 90;
      view = popoverInitialView;
    }

    return m('div.popover', {
      className: showTimelinesPopover ? '' : 'hide',
      style: 'height: ' + height +'px',
      config: function(element, isInitialized) {
        if (isInitialized)
          return;
        element.addEventListener(supportsTouch ? 'touchstart' : 'mousedown', function(event) {
          event.stopPropagation();
        });
        rootElement.addEventListener(supportsTouch ? 'touchstart' : 'mousedown', function() {
          ctrl.dispatchEvent({
            type: 'popoverhide'
          });
          ctrl.dispatchEvent({
            type: 'popovermodechange',
            mode: HeaderController.TIMELINES_POPOVER_MODE_INITIAL
          });
        });
      }
    }, view(ctrl));
  };

  var popoverInitialView = function(ctrl) {
    var timelineControllers = ctrl.timelineControllers();
    return [
      m('div.popover-header', [
        m('a.button', {
          href: '#',
          onclick: function() {
            ctrl.dispatchEvent({
              type: 'popovermodechange',
              mode: HeaderController.TIMELINES_POPOVER_MODE_ADD
            });
          }
        }, 'Add'),
        m('div.spacer', 'Timelines'),
        m('a.button', {
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
              m('div.text.initial', title)
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
        m('a.button', {
          href: '#',
          onclick: function() {
            ctrl.dispatchEvent({
              type: 'popovermodechange',
              mode: HeaderController.TIMELINES_POPOVER_MODE_INITIAL
            });
          }
        }, 'Cencel'),
        m('div.spacer', 'Add Timeline'),
        m('a.button.done', {
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
        m('div', 'URL'),
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
        m('a.button.hide', 'Add'),
        m('div.spacer', 'Edit Timelines'),
        m('a.button.done', {
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
            var $sortable = sortable(element, {
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
            m('a.popover-list-item-button', {
              className: 'index-' + index,
              href: '#'
            }, '×'),
            m('div.popover-list-item-title', [
              m('div.text.edit', title)
            ]),
            m('div.popover-list-item-handle', '|||')
          ]);
        }))
      ])
    ];
  };

  app.headerView = headerView;
  global.app = app;
})(this);