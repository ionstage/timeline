(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var headerView = function(ctrl) {
    return m('div.header.unselectable', [
      m('div.icon', ['||||']),
      m('input.scale', {
        type: 'range',
        onchange: m.withAttr('value', ctrl.scale),
        value: ctrl.scale()
      }),
      m('div.icon', ['| |']),
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