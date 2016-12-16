(function () {
  'use strict';

  angular
    .module('app.contributions')
    .controller('ContributionsController', ContributionsController);

  /* Design Ideas controller
     ======================================================================== */

  ContributionsController.$inject = [
    '$q',
    '$rootScope',
    '$scope',
    'cloudinary',
    'logger',
    'utility',
    'dataservice',
  ];
  /* @ngInject */
  function ContributionsController(
    $q,
    $rootScope,
    $scope,
    cloudinary,
    logger,
    utility,
    dataservice
  ) {
    var vm = this;
    vm.title = 'Contributions';

    /* Variables
       ================================================== */

    // Data
    vm.contribution = {};
    vm.myObservations = [];
    vm.file = null;

    // States

    // Function assignments
    vm.submit = submit;
    vm.reset = reset;
    activate();

    /* Activate function
       ================================================== */

    function activate() {
      utility.showSplash();

      var promises = [getMyObservations(), getAllProjects()];
      return $q.all(promises)
        .then(function () {
          utility.hideSplash();
          logger.info('Activated Contributions View');
        });
    }

    /* Listener Functions
       ================================================== */

    /* Data functions
       ================================================== */

    function getMyObservations() {
      var auth = dataservice.onAuthStateChanged(function (auth) {
        if (!!auth) {
          return dataservice.getObservationsByUserId(auth.uid)
            .then(function (data) {
              vm.myObservations = data;
              return vm.myObservations;
            });
        } else {
          vm.myObservations = [];
        }
      });
    }

    function getAllProjects() {
      return dataservice.getArray('activities')
        .then(function (data) {
          vm.allProjects = data;
          return vm.allProjects;
        });
    }

    /* Click functions
       ================================================== */
    function submit() {
      cloudinary.upload(vm.file, {}).then(function (resp) {
        if (resp.status === 200) {
          vm.contribution.data.image = resp.data.secure_url;
          vm.contribution.activity = vm.contribution.activity || '-ACES_a38';
          dataservice.addObservation(vm.contribution).then(function () {
            reset();
            logger.success('Your observation has been submitted!');
          });
        }
      });
    }

    function reset() {
      vm.contribution = {};
      vm.file = null;
    }

  }
})();
