'use strict';

angular.module('cart').service('Store', ['$window', function ($window) {

  return {
    get: function (key) {
      if ($window.localStorage[key]) {
        var storedObj = angular.fromJson($window.localStorage[key]);
        return JSON.parse(storedObj);
      }
      return false;
    },
    set: function(key, val) {
        if (val === undefined) {
            $window.localStorage.removeItem(key);
        } else {
          $window.localStorage[key] = angular.toJson(val);
        }

      return  $window.localStorage[key];
    }
    
  };
}]);