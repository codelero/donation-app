'use strict';

(function () {
  // Projects Controller Spec
  describe('Projects Controller Tests', function () {
    // Initialize global variables
    var ProjectsController,
      scope,
      $httpBackend,
      $stateParams,
      $location,
      Authentication,
      Projects,
      mockProject;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, _Authentication_, _Projects_) {
      // Set a new global scope
      scope = $rootScope.$new();

      // Point global variables to injected services
      $stateParams = _$stateParams_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      Authentication = _Authentication_;
      Projects = _Projects_;

      // create mock article
      mockProject = new Projects({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'An Project about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Projects controller.
      ProjectsController = $controller('ProjectsController', {
        $scope: scope
      });
    }));

    it('$scope.find() should create an array with at least one article object fetched from XHR', inject(function (Projects) {
      // Create a sample articles array that includes the new article
      var sampleProjects = [mockProject];

      // Set GET response
      $httpBackend.expectGET('api/articles').respond(sampleProjects);

      // Run controller functionality
      scope.find();
      $httpBackend.flush();

      // Test scope value
      expect(scope.articles).toEqualData(sampleProjects);
    }));

    it('$scope.findOne() should create an array with one article object fetched from XHR using a articleId URL parameter', inject(function (Projects) {
      // Set the URL parameter
      $stateParams.articleId = mockProject._id;

      // Set GET response
      $httpBackend.expectGET(/api\/articles\/([0-9a-fA-F]{24})$/).respond(mockProject);

      // Run controller functionality
      scope.findOne();
      $httpBackend.flush();

      // Test scope value
      expect(scope.article).toEqualData(mockProject);
    }));

    describe('$scope.craete()', function () {
      var sampleProjectPostData;

      beforeEach(function () {
        // Create a sample article object
        sampleProjectPostData = new Projects({
          title: 'An Project about MEAN',
          content: 'MEAN rocks!'
        });

        // Fixture mock form input values
        scope.title = 'An Project about MEAN';
        scope.content = 'MEAN rocks!';

        spyOn($location, 'path');
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (Projects) {
        // Set POST response
        $httpBackend.expectPOST('api/articles', sampleProjectPostData).respond(mockProject);

        // Run controller functionality
        scope.create();
        $httpBackend.flush();

        // Test form inputs are reset
        expect(scope.title).toEqual('');
        expect(scope.content).toEqual('');

        // Test URL redirection after the article was created
        expect($location.path.calls.mostRecent().args[0]).toBe('articles/' + mockProject._id);
      }));

      it('should set scope.error if save error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/articles', sampleProjectPostData).respond(400, {
          message: errorMessage
        });

        scope.create();
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      });
    });

    describe('$scope.update()', function () {
      beforeEach(function () {
        // Mock article in scope
        scope.article = mockProject;
      });

      it('should update a valid article', inject(function (Projects) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/articles\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        scope.update();
        $httpBackend.flush();

        // Test URL location to new object
        expect($location.path()).toBe('/articles/' + mockProject._id);
      }));

      it('should set scope.error to error response message', inject(function (Projects) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/articles\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        scope.update();
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      }));
    });

    describe('$scope.remove(article)', function () {
      beforeEach(function () {
        // Create new articles array and include the article
        scope.articles = [mockProject, {}];

        // Set expected DELETE response
        $httpBackend.expectDELETE(/api\/articles\/([0-9a-fA-F]{24})$/).respond(204);

        // Run controller functionality
        scope.remove(mockProject);
      });

      it('should send a DELETE request with a valid articleId and remove the article from the scope', inject(function (Projects) {
        expect(scope.articles.length).toBe(1);
      }));
    });

    describe('scope.remove()', function () {
      beforeEach(function () {
        spyOn($location, 'path');
        scope.article = mockProject;

        $httpBackend.expectDELETE(/api\/articles\/([0-9a-fA-F]{24})$/).respond(204);

        scope.remove();
        $httpBackend.flush();
      });

      it('should redirect to articles', function () {
        expect($location.path).toHaveBeenCalledWith('articles');
      });
    });
  });
}());