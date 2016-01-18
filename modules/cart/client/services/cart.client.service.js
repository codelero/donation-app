'use strict';

angular.module('cart').service('Cart', ['$rootScope', 'CartItem', 'Store', function ($rootScope, CartItem, Store) {

  //var this = this;

  this.init = function () {
    this.cart = {
      //items: [{_id: '9090909', title: 'cheese', amount: 20}],
      items: [],
      error: ''
    };
    this.save();
  };

  this.addItem = function (id, title, amount) {
    this.cart.error = '';
    var cartItems = this.cart.items;

    // Check if item exists in cart
    for (var i = 0; i < cartItems.length; i++) {
      if (cartItems[i]._id === id) {
        this.cart.error = 'Item already in cart';
        return;
      }
    }

    var newItem = new CartItem(id, title, amount);
    cartItems.push(newItem);

    $rootScope.$broadcast('Cart:change', {});

    //console.log(this.cart.items);

  };

  this.findItemById = function (id) {
    var cartItems = this.cart.items,
      foundItem = false;

    angular.forEach(cartItems, function (item) {
      if (item._id === id) {foundItem = item;}
    });

    return foundItem;
  };

  this.removeItemById = function (id) {
    var cartItems = this.cart.items;

    angular.forEach(cartItems, function (item, index) {
      if (item._id === id) { cartItems.splice(index, 1);}
    });

    $rootScope.$broadcast('Cart:change', {});

  };

  this.removeAllItems = function () {
    this.cart.items.length = 0;
  };

  //getTotalItems
  //this.getTotalItems = function() {
  //
  //}

  // getTotalAmount
  this.getTotalAmount = function () {
    var cartItems = this.cart.items, totalAmount = 0;

    angular.forEach(cartItems, function (item) {
      totalAmount += item.amount;
    });

    return totalAmount;
  };


  this.getCart = function () {
    return this.cart;
  };

  this.restore = function (storedCart) {
    var _self = this;

    _self.init();
    console.log(storedCart);
    angular.forEach(storedCart.items, function (item) {
      _self.cart.items.push(new CartItem(item._id, item.title, item.amount));
    });
  };


  //this.$restore = function (storedCart) {
  //  var _self = this;
  //  _self.init();
  //  _self.$cart.shipping = storedCart.shipping;
  //  _self.$cart.tax = storedCart.tax;
  //
  //  angular.forEach(storedCart.items, function (item) {
  //    _self.$cart.items.push(new ngCartItem(item._id, item._name, item._price, item._quantity, item._data));
  //  });
  //  this.$save();
  //};

  this.save = function () {
    return Store.set('cart', JSON.stringify(this.getCart()));
  };

}]);