(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;
  var util = global.util;

  var HeaderController = app.HeaderController;
  var TimelineController = app.TimelineController;

  var supportsTouch = util.supportsTouch;
  var rootElement = util.rootElement;

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
              name: 'daysAgo',
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
              name: 'daysAfter',
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
              name: 'pixelsPerDay',
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
        m('div.spacer'),
        m('a.button', {href: '#'}, 'Edit')
      ]),
      m('div.popover-content', [
        m('div.popover-list', timelineControllers.map(function(controller) {
          var state = controller.state();
          var title = controller.title();
          var className = '';
          if (state === TimelineController.STATE_LOAD_ERROR)
            className = 'load-error';
          return m('div.popover-list-item', {
            className: className
          }, [
            m('div.popover-list-item-title', title)
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
        m('div.spacer', 'Add'),
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
          type: 'text',
          config: function(element, isInitialized) {
            if (isInitialized)
              return;
            inputElementProp(element);
          }
        }, 'URL')
      ])
    ];
  };

  app.headerView = headerView;
  global.app = app;
})(this);