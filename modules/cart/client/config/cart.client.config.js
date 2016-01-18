'use strict';

angular.module('cart').run(['$rootScope', 'Cart', 'Store', function ($rootScope, Cart, Store) {

  $rootScope.$on('Cart:change', function(){
    Cart.save();
  });

  if (angular.isObject(Store.get('cart'))) {
    Cart.restore(Store.get('cart'));

  } else {
    Cart.init();
  }

}]);