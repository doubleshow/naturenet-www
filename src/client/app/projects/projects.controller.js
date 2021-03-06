(function () {
  'use strict';

  angular
    .module('app.projects')
    .controller('ProjectsController', ProjectsController);

  /* Projects controller
     ======================================================================== */

  ProjectsController.$inject = [
    '$rootScope',
    '$q',
    '$filter',
    '$window',
    'logger',
    'utility',
    'dataservice',
  ];

  /* @ngInject */
  function ProjectsController(
    $rootScope,
    $q,
    $filter,
    $window,
    logger,
    utility,
    dataservice
  ) {
    var vm = this;
    vm.title = 'Projects';

    /* Variables
       ================================================== */

    // Constants
    vm.displayLimit = 6;

    //Form
    vm.name = '';
    vm.description = '';

    //Search
    vm.query = '';

    // Data
    vm.projectId = void 0;
    vm.localSite = void 0;
    vm.localProjects = void 0;
    vm.projects = [];
    vm.projectObservations = [];
    vm.isDrawerVisible= $window.innerWidth > 750 ? true: false;
    vm.affiliations = {};
    vm.comments = void 0;

    // States
    vm.isProjectsListVisible = true;
    vm.projectObservation = {};

    // Function assignments
    vm.updateDrawer = updateDrawer;
    vm.updateProjectId = updateProjectId;
    vm.formatDate = utility.formatDate;
    vm.createProject = createProject;

    vm.show = false;

    //Settings -- This should be moved to the constants.js file
    var url = 'https://res.cloudinary.com/university-of-colorado/image/upload/v1464880363/static/Backyard_bd5me8.png';

    activate();

    /* Activate function
       ================================================== */

    function activate() {
      utility.showSplash();

      var promises = [getProjectRecentId(), getProjectsArray(), getLocalProjects(), getSites()];
      return $q.all(promises)
        .then(function () {
          var promises = [getObservationsByProjectId(vm.projectId)];
          $q.all(promises)
            .then(function () {
              utility.hideSplash();
              logger.info('Activated Projects View');
            });
        });
    }

    /* Data functions
       ================================================== */

    function getProjectRecentId() {
      return dataservice.getProjectsRecent(1)
        .then(function (data) {
          vm.projectId = data[0].id;
          return vm.projectId;
        });
    }

    function getProjectsArray() {
      return dataservice.getArray('activities')
        .then(function (data) {
          vm.projects = $filter('orderBy')(data, 'latest_contribution', true);
          return vm.projects;
        });
    }

    function getLocalProjects() {
      var auth = dataservice.getAuth();
      if (!auth) {
        return null;
      }
      if (!auth && !$rootScope.users[auth.uid]) {
        var affiliation = $rootScope.users[auth.uid].affiliation;
        dataservice.getSiteById(affiliation).then(function (data) {
          vm.localSite = data.name;
        });

        return dataservice.getProjectsAtSite(affiliation)
          .then(function (data) {
            vm.localProjects = data;
            return vm.localProjects;
          });
      } else {
        vm.localSite = '';
        vm.localProjects = void 0;
        return $q.when(null);
      }
    }

    function getObservationsByProjectId(id) {
      return dataservice.getObservationsByProjectId(id)
        .then(function (data) {
          vm.projectObservations = data;
          return vm.projectObservations;
        });
    }

    function createProject(title, description) {
      return dataservice.createProject(title, description)
        .then(function (data) {
          vm.projectObservations = data;
          return vm.projectObservations;
        });
    }

    function createProject() {

      var name = vm.name; //bound value
      var description = vm.description; //bound value
      var sites = vm.affiliations;

      return dataservice.createProject(name, description, sites, url)
        .then(function (data) {
          getProjectsArray()
        .then(function () {
          resetForm();
          logger.success('Project successfully submitted!');
        });
      });
    }

    function resetForm() {
      vm.name = '';
      vm.affiliations = {};
      vm.description = '';
    }

    function updateDrawer() {
      vm.isDrawerVisible=!vm.isDrawerVisible;
    }

    function closeDrawer() {
      vm.isDrawerVisible=false;
    }

    function getSites() {
      return dataservice.getArray('sites')
        .then(function (data) {
          vm.sites = data;
        });
    }

    $rootScope.$on('map:show', showObservation);

    function showObservation (event, o) {

      if (!!o) {
        loadComments(o);
        vm.projectObservation = o;
      }
    }
    function loadComments(currentObservation) {
      vm.comments = void 0;
      if (!!currentObservation) {
        return dataservice.getCommentsForRecord(currentObservation)
          .then(function (data) {
            vm.comments = data;
            return vm.comments;
          });
      }
    }

    /* Project function
       ================================================== */

    function updateProjectId(id) {
      var promises = [getObservationsByProjectId(id)];
      return $q.all(promises)
        .then(function () {
          vm.projectId = id;
          vm.show = true;
          //closeDrawer();
          logger.info('Updated Projects View based on new projectId');
        });
    }
  }
})();
