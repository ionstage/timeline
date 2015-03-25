(function(global) {
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

  if (typeof module !== 'undefined' && module.exports)
    module.exports = util;
  else
    global.util = util;
}(this));