(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;
  var util = global.util;

  var supportsTouch = util.supportsTouch;
  var rootElement = util.rootElement;

  var headerView = function(ctrl) {
    return m('div.header.unselectable', [
      m('div.time-span', [
        m('select', {
          onchange: m.withAttr('value', function(value) {
            value = +value;
            ctrl.daysAgo(value);
            ctrl.dispatchEvent({
              type: 'change',
              name: 'daysAgo',
              value: value
            });
          }),
          value: ctrl.daysAgo().toString()
        },[
          m('option', {value: '183'}, ['6 months ago']),
          m('option', {value: '365'}, ['1 year ago']),
          m('option', {value: '730'}, ['2 year ago'])
        ]),
        m('div.icon', ['I']),
        m('select', {
          onchange: m.withAttr('value', function(value) {
            value = +value;
            ctrl.daysAfter(value);
            ctrl.dispatchEvent({
              type: 'change',
              name: 'daysAfter',
              value: value
            });
          }),
          value: ctrl.daysAfter().toString()
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
            value = +value;
            ctrl.pixelsPerDay(value);
            ctrl.dispatchEvent({
              type: 'change',
              name: 'pixelsPerDay',
              value: value
            });
          }),
          value: ctrl.pixelsPerDay().toString()
        }),
        m('div.icon', ['| |'])
      ]),
      m('div.spacer'),
      m('a.button', {
        href: '#',
        onclick: function() {
          ctrl.dispatchEvent({
            type: 'click',
            name: 'today'
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
    return m('div.popover', {
      className: ctrl.showTimelinesPopover() ? '' : 'hide',
      style: 'height: ' + (timelineControllers.length * 42 + 90) +'px',
      config: function(element, isInitialized) {
        if (isInitialized)
          return;
        element.addEventListener(supportsTouch ? 'touchstart' : 'mousedown', function(event) {
          event.stopPropagation();
        });
        rootElement.addEventListener(supportsTouch ? 'touchstart' : 'mousedown', function(event) {
          ctrl.dispatchEvent({
            type: 'popoverhide'
          });
        });
      }
    }, [
      m('div.popover-header', [
        m('a.button', {href: '#'}, 'Add'),
        m('div.spacer'),
        m('a.button', {href: '#'}, 'Edit')
      ]),
      m('div.popover-content', [
        m('div.popover-list', ctrl.timelineControllers().map(function(controller) {
          return m('div.popover-list-item', [
            m('div.popover-list-item-title', controller.title())
          ]);
        }))
      ])
    ]);
  };

  app.headerView = headerView;
  global.app = app;
})(this);