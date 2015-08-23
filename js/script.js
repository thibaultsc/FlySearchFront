// js/script.js
'use strict';


/**
 * Déclaration de l'application flyWkApp
 */
var flyWkApp = angular.module('flyWkApp', [
    // Dépendances du "module"
    'ngRoute', 'flyWkAppControllers', 'ui.bootstrap'
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
flyWkAppControllers.controller('searchCtrl', ['$scope', '$http',
    function($scope,$http){
        
        $scope.init = function () {
            $scope.departureSelected = false;
            $scope.arrivalSelected = false;
            $scope.peopleSelected = false;
            $scope.anySelected = false;
        }
        $scope.init();

        var searchForm = $scope.searchForm;
        $scope.departure = "Paris";
        $scope.arrival = "New York";
        $scope.voyageurDetailsFunc = function (a,b) {
            var details = "";
            if (a == 1) {
                details = details + "1 Adulte";
            }
            if (a > 1) {
                details = details + a + " Adultes";
            }
            if (b == 1) {
                if (a > 0) {
                    details = details + " / ";
                }
                details = details + "1 Enfant ";
            }   
            if (b > 1) {
                if (a > 0) {
                    details = details + " / ";
                }
                details = details + b + " Enfants ";
            }
            return details; 
        }
        $scope.nbAdultes = 1;
        $scope.nbEnfants = 0;
        $scope.voyageurDetails = $scope.voyageurDetailsFunc($scope.nbAdultes,$scope.nbEnfants);
        
        $scope.updatePeople = function() {
            $scope.voyageurDetails = $scope.voyageurDetailsFunc($scope.nbAdultes,$scope.nbEnfants);
        };
        
        
        $scope.searchSubmit = function() {
            $scope.departure = "Bruxelles";
        };
        
        $scope.departureSelect = function($event) {
            $scope.init();
            $scope.departureSelected = true;
            $scope.anySelected = true;
            $event.target.select();
        };
        $scope.arrivalSelect = function($event) {
            $scope.init();
            $scope.arrivalSelected = true;
            $scope.anySelected = true;
            $event.target.select();
        };
        $scope.peopleSelect = function() {
            $scope.init();
            $scope.peopleSelected = true;
            $scope.anySelected = true;
        };
        
        $scope.airportSelect = function($content) {
            if ($scope.departureSelected) {
                $scope.departure = $content;
                
            }
            if ($scope.arrivalSelected) {
                $scope.arrival = $content;
            }
        };
        
        $scope.favoriteDepartures = [{"PlaceId":"PARI","PlaceName":"Paris","CountryId":"FR","CityId":"PARI","CountryName":"France","PlaceNameEn":"Paris","RegionId":"","CityName":"Paris","CityNameEn":"Paris"},{"PlaceId":"CDG","PlaceName":"Paris Charles-de-Gaulle","CountryId":"FR","CityId":"PARI","CountryName":"France","PlaceNameEn":"Paris Charles de Gaulle","RegionId":"","CityName":"Paris","CityNameEn":"Paris"},{"PlaceId":"ORY","PlaceName":"Paris Orly","CountryId":"FR","CityId":"PARI","CountryName":"France","PlaceNameEn":"Paris Orly","RegionId":"","CityName":"Paris","CityNameEn":"Paris"},{"PlaceId":"BVA","PlaceName":"Paris Beauvais","CountryId":"FR","CityId":"PARI","CountryName":"France","PlaceNameEn":"Paris Beauvais","RegionId":"","CityName":"Paris","CityNameEn":"Paris"},{"PlaceId":"LTQ","PlaceName":"Le Touquet Paris Plag","CountryId":"FR","CityId":"LETO","CountryName":"France","PlaceNameEn":"Le Touquet Paris Plag","RegionId":"","CityName":"Le Touquet Paris Plag","CityNameEn":"Le Touquet Paris Plag"},{"PlaceId":"XCR","PlaceName":"Ch\u00E2lons-en-Champagne","CountryId":"FR","CityId":"XCRA","CountryName":"France","PlaceNameEn":"Ch\u00E2lons-en-Champagne","RegionId":"","CityName":"Ch\u00E2lons-en-Champagne","CityNameEn":"Ch\u00E2lons-en-Champagne"},{"PlaceId":"PIN","PlaceName":"Parintins","CountryId":"BR","CityId":"PINA","CountryName":"Br\u00E9sil","PlaceNameEn":"Parintins","RegionId":"","CityName":"Parintins","CityNameEn":"Parintins"},{"PlaceId":"YQU","PlaceName":"Grande Prairie","CountryId":"CA","CityId":"YQUA","CountryName":"Canada","PlaceNameEn":"Grande Prairie","RegionId":"","CityName":"Grande Prairie","CityNameEn":"Grande Prairie"}];
        $scope.favoriteDestinations = [{"name":"Bangkok (BKK)"},{"name":"New York (NYC)"},{"name":"Barcelone (BAR)"},{"name":"Dubai (DBX)"},{"name":"Hong Kong (HKK)"},{"name":"Budapest (BUD)"}];
        $scope.findDeparture = function () {
        $http.jsonp("http://www.skyscanner.fr/dataservices/geo/v1.1/autosuggest/UK/fr-FR/"+$scope.departure+"?callback=JSON_CALLBACK")
            .success( function(data) {
            console.log(data.found);
                //$scope.favoriteDepartures = [{"PlaceName":"Paris (PAR)"}];
            })
            .finally(function(data) {
            console.log($scope.favoriteDepartures);
                //$scope.favoriteDepartures = data;
            })
        
        }

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


/**
 * Nouveau controller pour la gestion du date picker
 */
flyWkAppControllers.controller('DatepickerDemoCtrl', function ($scope) {
  
  $scope.firstdate = function() {
    $scope.departuredate = new Date() ;
    $scope.departuredate.setDate($scope.departuredate.getDate()+7);
    $scope.arrivaldate = new Date() ;
    $scope.arrivaldate.setDate($scope.departuredate.getDate()+14);
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

