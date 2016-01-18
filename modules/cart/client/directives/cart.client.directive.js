'use strict';

angular.module('cart').directive('cart', function() {
    return {
      restrict: 'E',
      templateUrl: 'modules/cart/views/cart.client.view.html',
      controller: 'CartController'
    };
});