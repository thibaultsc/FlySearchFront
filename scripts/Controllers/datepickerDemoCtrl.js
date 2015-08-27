'use strict';

/**
 * Nouveau controller pour la gestion du date picker
 */
flyWkAppControllers.controller('DatepickerDemoCtrl', function ($scope) {
  
  $scope.firstdate = function() {
    $scope.departuredate = new Date() ;
    $scope.departuredate.setDate($scope.departuredate.getDate()+7);
    $scope.arrivaldate = new Date() ;
    $scope.arrivaldate.setDate($scope.departuredate.getDate()+7);
  };
  $scope.firstdate();

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
  };
  $scope.toggleMin();

  $scope.open = function($event) {  
    $scope.status.opened = true;
  };


  $scope.status = {
    opened: false
  };

  $scope.getDayClass = function(date, mode) {
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0,0,0,0);

      for (var i=0;i<$scope.events.length;i++){
        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  };
});