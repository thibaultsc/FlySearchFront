// js/script.js
'use strict';


/**
 * Déclaration de l'application flyWkApp
 */
var flyWkApp = angular.module('flyWkApp', [
    // Dépendances du "module"
    'ngRoute',
    'flyWkAppControllers'
]);


/**
 * Configuration du module principal : flyWkApp
 */
flyWkApp.config(['$routeProvider',
    function($routeProvider) { 
        
        // Système de routage
        $routeProvider
        .when('/search', {
            templateUrl: 'partials/search.html',
            controller: 'searchCtrl'
        })
        .when('/contact/:msg?', {
            templateUrl: 'partials/contact.html',
            controller: 'contactCtrl'
        })
        .otherwise({
            redirectTo: '/search'
        });
    }
]);





/**
 * Définition des contrôleurs
 */
var flyWkAppControllers = angular.module('flyWkAppControllers', []);

// Contrôleur de la page d'accueil
flyWkAppControllers.controller('searchCtrl', ['$scope',
    function($scope){
        $scope.message = "Bienvenue sur la page d'accueil";
        var searchForm = $scope.searchForm;
        $scope.departure = "Paris";
        $scope.arrival = "New York";
        
        $scope.searchSubmit = function() {
            $scope.departure = "Bruxelles";
        };
        

    }
]);

// Contrôleur de la page de contact
flyWkAppControllers.controller('contactCtrl', ['$scope','$routeParams',
    function($scope, $routeParams){
        $scope.message = "Laissez-nous un message sur la page de contact !";
        $scope.msg = $routeParams.msg || "Bonne chance pour cette nouvelle appli !";
    }
]);



/**
 * Ajout de Directives
 */
flyWkAppControllers.directive("datePicker",function() {
    return {
        restrict: "A",
        require : 'ngmodel',
        link : function (scope, element, attrs, ngModelController) {
            element.datepicker({
                dateFormat:'dd/mm/yy',
                onSelect: function (date) {
                    scope.$apply(function () {
                        ngModelController.$setViewValue(date);
                    });
                }
            });
        }
    };
});


