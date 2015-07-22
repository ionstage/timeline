(function(app) {
  'use strict';
  var util = {};

  util.inherits = function(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return ctor;
  };

  util.invoke = function(array, methodName) {
    var args = Array.prototype.slice.call(arguments, 2);
    return array.map(function(value) {
      return value[methodName].apply(value, args);
    });
  };

  util.sortBy = function(array, key) {
    return array.concat().sort(function(a, b) {
      return a[key] - b[key];
    });
  };

  util.camelCase = function(s) {
    return s.replace(/-(.)/g, function(_, g) {
      return g.toUpperCase();
    });
  };

  util.startOfDay = function() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  };

  util.addDays = function(date, n) {
    return new Date(date.getTime() + n * 86400000);
  };

  util.diffDays = function(date0, date1) {
    return (date0.getTime() - date1.getTime()) / 86400000;
  };

  util.supportsTouch = function() {
    return 'createTouch' in document;
  };

  util.rootElement = function() {
    return document.documentElement;
  };

  util.windowWidth = function() {
    return window.innerWidth;
  };

  util.windowHeight = function() {
    return window.innerHeight;
  };

  util.openWindow = function(url) {
    window.open(url, '_blank');
  };

  util.addResizeEvent = function(listener) {
    window.addEventListener('resize', listener);
  };

  util.el = function(selector) {
    return document.querySelector(selector);
  };

  util.closest = function(el, selector) {
    var indexOf = Array.prototype.indexOf;
    while (el) {
      var parentNode = el.parentNode;
      if (!parentNode)
        return null;
      if (indexOf.call(parentNode.querySelectorAll(selector), el) !== -1)
        return el;
      el = parentNode;
    }
  };

  util.translateX = function(el, x) {
    var value = 'translateX(' + x + 'px)';
    el.style.transform =  value;
    el.style.webkitTransform = value;
    el.style.MozTransform = value;
    el.style.msTransform = value;
    el.style.OTransform = value;
  };

  util.getJSON = function(url) {
    return jQuery.getJSON(url);
  };

  util.sortable = function(el, option) {
    return jQuery(el).sortable(option);
  };

  util.loadData = function(key, defaultValue) {
    var value = localStorage.getItem(storageKey(key));
    if (value === null && typeof defaultValue !== 'undefined')
      return defaultValue;
    return JSON.parse(value);
  };

  util.saveData = function(key, data) {
    localStorage.setItem(storageKey(key), JSON.stringify(data));
  };

  var storageKey = function(key) {
    return 'org.ionstage.timeline.' + key;
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = util;
  else
    app.util = util;
})(this.app || (this.app = {}));