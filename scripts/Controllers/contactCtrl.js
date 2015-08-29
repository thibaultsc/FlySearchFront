'use strict';

// Contrôleur de la page de contact
flyWkAppControllers.controller('contactCtrl', ['$scope', '$http', 'Restangular',
    function($scope,$http,Restangular, $routeParams){

        var apiFlySearches = Restangular.all('api/fly_searches/5');
        
        $scope.subFlySearches = [];        
        var retailersCache = {};
        $scope.refreshSubFlySearches = function () {
            if (retailersCache[name]) {
                $scope.createRetailers = retailersCache[name];
                return;
            }
            
            apiFlySearches.get().then(function(retailers) {
                retailersCache[name] = retailers;
                $scope.subFlySearches = retailers;
            });
        };
        
        $scope.refreshSubFlySearches();
        
        
        
        
        
        
        
        
    }
]);