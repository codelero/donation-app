'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
  // Init module configuration options
  var applicationModuleName = 'mean';
  var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ui.router', 'ui.bootstrap', 'ui.utils', 'ngLodash', 'angularFileUpload'];

  // Add a new vertical module
  var registerModule = function (moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
  function ($locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');
  }
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(["$rootScope", "$state", "Authentication", function ($rootScope, $state, Authentication) {
  // Check authentication before changing state
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
      var allowed = false;
      toState.data.roles.forEach(function (role) {
        if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
          allowed = true;
          return true;
        }
      });

      if (!allowed) {
        event.preventDefault();
        $state.go('authentication.signin', {}, {
          notify: false
        }).then(function () {
          $rootScope.$broadcast('$stateChangeSuccess', 'authentication.signin', {}, toState, toParams);
          console.log(toState);
        });
      }
    }
  });

  // Record previous state
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    $state.previous = {
      state: fromState,
      params: fromParams,
      href: $state.href(fromState, fromParams)
    };
  });
}]);

//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash === '#_=_') {
    window.location.hash = '#!';
  }

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('cart');
//ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('projects');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users', ['core']);
ApplicationConfiguration.registerModule('users.admin', ['core.admin']);
ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes']);

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

'use strict';

angular.module('cart').directive('cart', function() {
    return {
      restrict: 'E',
      templateUrl: 'modules/cart/views/cart.client.view.html',
      controller: 'CartController'
    };
});
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
'use strict';

angular.module('core.admin').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
  }
]);

'use strict';

// Setting up route
angular.module('core.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      });
  }
]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise('not-found');

    // Home state routing
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'modules/core/views/home.client.view.html'
      })
      .state('not-found', {
        url: '/not-found',
        templateUrl: 'modules/core/views/404.client.view.html'
      });
  }
]);

'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus',
  function ($scope, $state, Authentication, Menus) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);

'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [
  function () {
    // Define a set of default roles
    this.defaultRoles = ['*'];

    // Define the menus object
    this.menus = {};

    // A private function for rendering decision
    var shouldRender = function (user) {
      if (user) {
        if (!!~this.roles.indexOf('*')) {
          return true;
        } else {
          for (var userRoleIndex in user.roles) {
            for (var roleIndex in this.roles) {
              if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
                return true;
              }
            }
          }
        }
      } else {
        return this.isPublic;
      }

      return false;
    };

    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exist');
        }
      } else {
        throw new Error('MenuId was not provided');
      }

      return false;
    };

    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      return this.menus[menuId];
    };

    // Add new menu object by menu id
    this.addMenu = function (menuId, options) {
      options = options || {};

      // Create the new menu
      this.menus[menuId] = {
        isPublic: ((options.isPublic === null || typeof options.isPublic === 'undefined') ? true : options.isPublic),
        roles: options.roles || this.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      delete this.menus[menuId];
    };

    // Add menu item object
    this.addMenuItem = function (menuId, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Push new menu item
      this.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        class: options.class,
        isPublic: ((options.isPublic === null || typeof options.isPublic === 'undefined') ? this.menus[menuId].isPublic : options.isPublic),
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].roles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Add submenu items
      if (options.items) {
        for (var i in options.items) {
          this.addSubMenuItem(menuId, options.link, options.items[i]);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Add submenu item object
    this.addSubMenuItem = function (menuId, parentItemState, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === parentItemState) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            isPublic: ((options.isPublic === null || typeof options.isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : options.isPublic),
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    //Adding the topbar menu
    this.addMenu('topbar', {
      isPublic: false
    });
  }
]);

'use strict';

// Create the Socket.io wrapper service
angular.module('core').service('Socket', ['Authentication', '$state', '$timeout',
  function (Authentication, $state, $timeout) {
    // Connect to Socket.io server
    this.connect = function () {
      // Connect only when authenticated
      if (Authentication.user) {
        this.socket = io();
      }
    };
    this.connect();

    // Wrap the Socket.io 'on' method
    this.on = function (eventName, callback) {
      if (this.socket) {
        this.socket.on(eventName, function (data) {
          $timeout(function () {
            callback(data);
          });
        });
      }
    };

    // Wrap the Socket.io 'emit' method
    this.emit = function (eventName, data) {
      if (this.socket) {
        this.socket.emit(eventName, data);
      }
    };

    // Wrap the Socket.io 'removeListener' method
    this.removeListener = function (eventName) {
      if (this.socket) {
        this.socket.removeListener(eventName);
      }
    };
  }
]);

'use strict';

// Configuring the Projects module

// Used to auto add projects to menu, Currently added manually.

//angular.module('projects').run(['Menus',
//  function (Menus) {
//    // Add the projects dropdown item
//    Menus.addMenuItem('topbar', {
//      title: 'Projects',
//      state: 'projects',
//      type: 'dropdown'
//    });
//
//    // Add the dropdown list item
//    Menus.addSubMenuItem('topbar', 'projects', {
//      title: 'List Projects',
//      state: 'projects.list'
//    });
//
//    // Add the dropdown create item
//    Menus.addSubMenuItem('topbar', 'projects', {
//      title: 'Create Projects',
//      state: 'projects.create'
//    });
//  }
//]);

'use strict';

// Setting up route
angular.module('projects').config(['$stateProvider',
  function ($stateProvider) {
    // Project state routing
    $stateProvider
      .state('projects', {
        abstract: true,
        url: '/projects',
        templateUrl: 'modules/projects/views/shell-projects.client.view.html',
        data: {
          //roles: ['user', 'admin', 'guest']
        }
      })
      .state('projects.list', {
        url: '',
        templateUrl: 'modules/projects/views/list-projects.client.view.html'
      })
      .state('projects.create', {
        url: '/create',
        templateUrl: 'modules/projects/views/create-project.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('projects.view', {
        url: '/:projectSlug',
        templateUrl: 'modules/projects/views/view-project.client.view.html'
      })
      .state('projects.edit', {
        url: '/:projectSlug/edit',
        templateUrl: 'modules/projects/views/edit-project.client.view.html'
      });
  }
]);

'use strict';

// Projects controller
angular.module('projects').controller('ProjectsController', ['$q','$scope', '$stateParams', '$location', 'Authentication', 'Projects', 'lodash', 'Cart',
  function ($q, $scope, $stateParams, $location, Authentication, Projects, lodash, Cart) {

    $scope.error = '';

    $scope.$on('Cart:change', function() {
      $scope.error = '';
    });

    $scope.authentication = Authentication;

    $scope.currentCatergory = 'Emergency';

    $scope.setCurrentCategory =function(currentCategory) {
      $scope.currentCatergory = currentCategory;
    };

    // Create new Project
    $scope.create = function () {
      console.log(this);
      // Create new Project object
      var project = new Projects({
        title: this.title,
        description: this.description,
        category: this.category,
        amount: this.amount,
        appeal: this.appeal
      });

      // Redirect after save
      project.$save(function (response) {
        $location.path('projects/' + response.slug);

        // Clear form fields
        $scope.title = '';
        $scope.description = '';
        $scope.amount = '';
        $scope.appeal = false;
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Project
    $scope.remove = function (project) {
      if (project) {
        project.$remove();

        for (var i in $scope.projects) {
          if ($scope.projects[i] === project) {
            $scope.projects.splice(i, 1);
          }
        }
      } else {
        $scope.project.$remove(function () {
          $location.path('projects');
        });
      }
    };

    // Update existing Project
    $scope.update = function () {
      var project = $scope.project, cartItem;

      cartItem = Cart.findItemById(project._id);

      if (cartItem) {
        cartItem.setTitle(project.title);
        cartItem.setAmount(project.amount);
      }


      console.log(cartItem);

      project.$update(function () {
        $location.path('projects/' + project.slug);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Projects
    $scope.find = function () {
      //var defer = $q.defer();
      $scope.error = '';

      Projects.query({}, function(projects) {
        $scope.projects = projects;
        $scope.categories = lodash.groupBy(projects, 'category');
        //console.log($scope.categories);
      });

    };

    $scope.findOne = function () {
      $scope.error = '';


      $scope.project = Projects.get({
        projectSlug: $stateParams.projectSlug
      });
    };

    $scope.addToCart = function(id, title, amount) {
        Cart.addItem(id, title, amount);

      $scope.error = Cart.cart.error;

    };


    //console.log($stateParams);
  }
]);

'use strict';

//Projects service used for communicating with the projects REST endpoints
angular.module('projects').factory('Projects', ['$resource',
  function ($resource) {
    // Binds resource obj with mongoose Schema field
    return $resource('api/projects/:projectSlug', {
      projectSlug: '@slug'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

// Configuring the Articles module
angular.module('users.admin').run(['Menus',
  function (Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Users',
      state: 'admin.users'
    });
  }
]);

'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/views/admin/user-list.client.view.html',
        controller: 'UserListController'
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/users/views/admin/user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/users/views/admin/user-edit.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      });
  }
]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user
                Authentication.user = null;

                // Redirect to signin page
                $location.path('signin');
                break;
              case 403:
                // Add unauthorized behaviour
                break;
            }

            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/views/settings/settings.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/views/settings/change-password.client.view.html'
      })
      .state('settings.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/views/settings/manage-social-accounts.client.view.html'
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/views/settings/change-profile-picture.client.view.html'
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/views/authentication/signup.client.view.html'
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/views/authentication/signin.client.view.html'
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/views/password/reset-password.client.view.html'
      });
  }
]);

'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin',
  function ($scope, $filter, Admin) {
    Admin.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
  }
]);

'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve',
  function ($scope, $state, Authentication, userResolve) {
    $scope.authentication = Authentication;
    $scope.user = userResolve;

    $scope.remove = function (user) {
      if (confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();

          $scope.users.splice($scope.users.indexOf(user), 1);
        } else {
          $scope.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    };

    $scope.update = function () {
      var user = $scope.user;

      user.$update(function () {
        $state.go('admin.user', {
          userId: user._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication',
  function ($scope, $state, $http, $location, $window, Authentication) {
    $scope.authentication = Authentication;

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function () {
      $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    $scope.signin = function () {
      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      var redirect_to;

      if ($state.previous) {
        redirect_to = $state.previous.href;
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url + (redirect_to ? '?redirect_to=' + encodeURIComponent(redirect_to) : '');
    };
  }
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
  function ($scope, $stateParams, $http, $location, Authentication) {
    $scope.authentication = Authentication;

    //If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    $scope.askForPasswordReset = function () {
      $scope.success = $scope.error = null;

      $http.post('/api/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;

      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };

    // Change user password
    $scope.resetUserPassword = function () {
      $scope.success = $scope.error = null;

      $http.post('/api/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangePasswordController', ['$scope', '$http', 'Authentication',
  function ($scope, $http, Authentication) {
    $scope.user = Authentication.user;

    // Change user password
    $scope.changeUserPassword = function () {
      $scope.success = $scope.error = null;

      $http.post('/api/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangeProfilePictureController', ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader',
  function ($scope, $timeout, $window, Authentication, FileUploader) {
    $scope.user = Authentication.user;
    $scope.imageURL = $scope.user.profileImageURL;

    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: 'api/users/picture'
    });

    // Set file uploader image filter
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            $scope.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the user has successfully uploaded a new picture
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      $scope.success = true;

      // Populate user object
      $scope.user = Authentication.user = response;

      // Clear upload buttons
      $scope.cancelUpload();
    };

    // Called after the user has failed to uploaded a new picture
    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      $scope.cancelUpload();

      // Show error message
      $scope.error = response.message;
    };

    // Change user profile picture
    $scope.uploadProfilePicture = function () {
      // Clear messages
      $scope.success = $scope.error = null;

      // Start upload
      $scope.uploader.uploadAll();
    };

    // Cancel the upload process
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
      $scope.imageURL = $scope.user.profileImageURL;
    };
  }
]);

'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      if (isValid) {
        $scope.success = $scope.error = null;
        var user = new Users($scope.user);

        user.$update(function (response) {
          $scope.success = true;
          Authentication.user = response;
        }, function (response) {
          $scope.error = response.data.message;
        });
      } else {
        $scope.submitted = true;
      }
    };
  }
]);

'use strict';

angular.module('users').controller('SocialAccountsController', ['$scope', '$http', 'Authentication',
  function ($scope, $http, Authentication) {
    $scope.user = Authentication.user;

    // Check if there are additional accounts
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }

      return false;
    };

    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
    };

    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;

      $http.delete('/api/users/accounts', {
        params: {
          provider: provider
        }
      }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SettingsController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    $scope.user = Authentication.user;
  }
]);

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function ($window) {
    var auth = {
      user: $window.user
    };

    return auth;
  }
]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Users service
angular.module('users.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
