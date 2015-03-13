(function(global) {
  'use strict';
  var app = global.app || {};
  var m = global.m;

  var headerView = function(ctrl) {
    return m('div.header.unselectable', [
      m('div.icon', ['||||']),
      m('input.scale', {type: 'range'}),
      m('div.icon', ['| |']),
      m('div.spacer'),
      m('a.button.today', {href: '#'}, 'Today'),
      m('a.button.edit', {href: '#'}, 'Edit')
    ]);
  };

  app.headerView = headerView;
  global.app = app;
})(this);