(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

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
      m('a.button.today', {
        href: '#',
        onclick: function() {
          ctrl.dispatchEvent({
            type: 'click',
            name: 'today'
          });
        }
      }, 'Today'),
      m('a.button.timelines', {
        href: '#',
        onclick: function() {
          ctrl.dispatchEvent({
            type: 'click',
            name: 'timelines'
          });
        }
      }, 'Timelines')
    ]);
  };

  app.headerView = headerView;
  global.app = app;
})(this);