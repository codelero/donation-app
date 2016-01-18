'use strict';

describe('Projects E2E Tests:', function () {
  describe('Test projects page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3000/projects');
      expect(element.all(by.repeater('project in projects')).count()).toEqual(0);
    });
  });
});
