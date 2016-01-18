'use strict';

angular.module('cart').controller('CartController', ['$scope', 'Cart', function ($scope, Cart) {
  $scope.cart = Cart;
  $scope.cartItems = Cart.cart.items;


  $scope.removeFromCart = function (id) {
    Cart.removeItemById(id);
  };

  $scope.removeAllFromCart = function () {
    Cart.removeAllItems();
  };
}]);
