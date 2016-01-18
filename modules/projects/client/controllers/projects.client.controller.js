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
