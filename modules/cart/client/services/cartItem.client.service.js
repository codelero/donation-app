'use strict';

angular.module('cart').factory('CartItem', ['$rootScope', '$log', function ($rootScope, $log) {

  var item = function (id, title, amount) {
    this.setId(id);
    this.setTitle(title);
    this.setAmount(amount);
  };

  item.prototype.setId = function (id) {
    if (id) {
      this._id = id;
    } else {
      $log.error('Item must have an ID');
    }
  };

  item.prototype.getId = function () {
    return this.id;
  };

  item.prototype.setTitle = function (title) {
    if (title) {
      this.title = title;
    } else {
      $log.error('Item must have an Title');
    }
  };

  item.prototype.getTitle = function () {
    return this.title;
  };

  item.prototype.setAmount = function (amount) {
    if (amount) {
      this.amount = amount;
    } else {
      $log.error('Item must have an Amount');
    }
  };

  item.prototype.getAmount = function () {
    return this.amount;
  };

  return item;
}]);