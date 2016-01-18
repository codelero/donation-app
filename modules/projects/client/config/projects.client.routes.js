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
