(function () {
  'use strict';

  angular
    .module('app.widgets')
    .directive('nnSocialTotals', nnSocialTotals);

  /* @ngInject */
  function nnSocialTotals() {
    // Usage:
    //   <nn-social-totals class="totals" data="obj">
    //   </nn-social-totals>
    // Creates:
    //   <div class="totals">
    //     <div class="totals__likes">1</div>
    //     <div class="totals__dislikes">2</div>
    //     <div class="totals__comments">3</div>
    //   </div>
    var directive = {
      scope: {
        data: '=',
        showDislikes: '=',
        context: '@',
      },
      link: link,
      templateUrl: 'app/widgets/nn-social-totals.html',
      restrict: 'EA',
      controller: ['$scope', 'dataservice', controller],
    };
    return directive;

    function link(scope, element, attrs) {
      scope.$watchCollection('data.likes', findTotals);
      scope.$watchCollection('data.comments', findTotals);

      function findTotals() {
        scope.likes = findTotal('likes', true);
        scope.dislikes = findTotal('likes', false);
        scope.comments = findTotal('comments', true);

        scope.liked = (!!scope.data.likes && scope.data.likes[scope.uid] === true);
        scope.disliked = (!!scope.data.likes && scope.data.likes[scope.uid] === false);
      }

      function findTotal(key, val) {
        if (!!scope.data[key]) {
          var total = 0;
          var k = void 0;

          for (k in scope.data[key]) {
            if (!((typeof val !== 'undefined') && (scope.data[key][k] !== val))) {
              total++;
            }
          }

          return total;
        } else {
          return 0;
        }
      }

    }

    function controller($scope, dataservice) {

      var auth = dataservice.getAuth();
      $scope.uid = auth ? auth.uid : null;

      $scope.doLike = function () {
        if (!!$scope.context) {
          dataservice.likeContent($scope.context, $scope.data, true);
        }
      };

      $scope.doDislike = function () {
        if (!!$scope.context) {
          dataservice.likeContent($scope.context, $scope.data, false);
        }
      };

    }
  }
})();
