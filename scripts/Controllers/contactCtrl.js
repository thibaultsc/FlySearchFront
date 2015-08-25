'use strict';

// Contrôleur de la page de contact
flyWkAppControllers.controller('contactCtrl', ['$scope','$routeParams',
    function($scope, $routeParams){
        $scope.message = "Laissez-nous un message sur la page de contact !";
        $scope.msg = $routeParams.msg || "Bonne chance pour cette nouvelle appli !";
    }
]);