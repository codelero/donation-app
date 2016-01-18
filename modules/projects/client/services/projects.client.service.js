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
