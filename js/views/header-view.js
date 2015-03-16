(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var headerView = function(ctrl) {
    return m('div.header.unselectable', [
      m('div.time-span', [
        m('select', {
          onchange: m.withAttr('value', function(value) {
            ctrl.daysAgo(+value);
          }),
          value: ctrl.daysAgo().toString()
        },[
          m('option', {value: '-183'}, ['6 months ago']),
          m('option', {value: '-365'}, ['1 year ago']),
          m('option', {value: '-730'}, ['2 year ago'])
        ]),
        m('div.icon', ['I']),
        m('select', {
          onchange: m.withAttr('value', function(value) {
            ctrl.daysAfter(+value);
          }),
          value: ctrl.daysAfter().toString()
        }, [
          m('option', {value: '183'}, ['6 months after']),
          m('option', {value: '365'}, ['1 year after']),
          m('option', {value: '730'}, ['2 year after'])
        ])
      ]),
      m('div.scale', [
        m('div.icon', ['||||']),
        m('input', {
          type: 'range',
          onchange: m.withAttr('value', ctrl.scale),
          value: ctrl.scale()
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
      m('a.button.edit', {
        href: '#',
        onclick: function() {
          ctrl.dispatchEvent({
            type: 'click',
            name: 'edit'
          });
        }
      }, 'Edit')
    ]);
  };

  app.headerView = headerView;
  global.app = app;
})(this);