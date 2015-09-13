'use strict';

// Contrôleur de la page d'accueil
flyWkAppControllers.controller('searchCtrl', ['$scope', '$http', 'Restangular',
    function($scope,$http,Restangular){
        
        $scope.init = function () {
            $scope.departureSelected = false;
            $scope.arrivalSelected = false;
            $scope.peopleSelected = false;
            $scope.anySelected = false;
        }
        $scope.init();
        
        $scope.flySearch = {
                departures: []//,
                //arrivals: []
        };

        var searchForm = $scope.searchForm;

        $scope.voyageurDetailsFunc = function (a1,b1) {
            var a = parseInt(a1);
            var b = parseInt(b1);
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
        
        $scope.updatePeople = function() {
            $scope.voyageurDetails = $scope.voyageurDetailsFunc($scope.flySearch.nbAdults,$scope.flySearch.nbChildren);
        }
        $scope.flySearch.nbAdults = '1';
        $scope.flySearch.nbChildren = '0';
        $scope.updatePeople();
        
        
        
        $scope.departureSelect = function($event) {
            $scope.init();
            $scope.departureSelected = true;
            $scope.anySelected = true;
            //$event.target.select();
        };
        $scope.arrivalSelect = function($event) {
            $scope.init();
            $scope.arrivalSelected = true;
            $scope.anySelected = true;
            //$event.target.select();
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
        
        var apiAirports = Restangular.all('api/airports');
        
        $scope.possibleDepartures = [];
        $scope.possibleArrivals = [];
        $scope.favoriteArrivals = [{"name":"Bangkok (BKK)"},{"name":"New York (NYC)"},{"name":"Barcelone (BAR)"},{"name":"Dubai (DBX)"},{"name":"Hong Kong (HKK)"},{"name":"Budapest (BUD)"}];
        $scope.favoriteDepartures = [{"name":"Bangkok (BKK)"},{"name":"New York (NYC)"},{"name":"Barcelone (BAR)"},{"name":"Dubai (DBX)"},{"name":"Hong Kong (HKK)"},{"name":"Budapest (BUD)"}];
        
        var retailersCache = {};
        $scope.refreshPossibleDepartures = function (name) {
            if (retailersCache[name]) {
                $scope.createRetailers = retailersCache[name];
                return;
            }
            
            apiAirports.getList({ name: name }).then(function(retailers) {
                retailersCache[name] = retailers;
                $scope.possibleDepartures = retailers;
            });
        };
        $scope.refreshPossibleArrivals = function (name) {
            if (retailersCache[name]) {
                $scope.createRetailers = retailersCache[name];
                return;
            }
            
            apiAirports.getList({ name: name }).then(function(retailers) {

                $scope.possibleArrivals = retailers;
            });
        };

        $scope.refreshPossibleDepartures('');
        $scope.refreshPossibleArrivals('');
        
        
        var apiSearch = Restangular.all('api/fly_searches/create');
        

        
        //  Fly Search creation
        $scope.createFlySearch = function() {
            var arrivals = [];
            $scope.createViolations = [];
            for (var i = 0; i < $scope.flySearch.arrivals.length; i++) {
                arrivals.push($scope.flySearch.arrivals[i]['@id']);
            }
            
            
            var flySearch = {
                departure: $scope.flySearch.departure['@id'],
                arrivals : arrivals,
                departureDate: new Date(), //$scope.flySearch.departureDate,
                arrivalDate: new Date(), //$scope.flySearch.arrivalDate,
                nbAdults: parseInt($scope.flySearch.nbAdults),
                nbChildren: parseInt($scope.flySearch.nbChildren)
            };

            apiSearch.post(flySearch).then(function() {
                $scope.createSuccess = true;
                $scope.createViolations = [];

                //$scope.createFlySearchForm.$setPristine();
                // show results

            }, function(response) {
                $scope.createSuccess = false;
                $scope.createViolations = response.data.violations;
            });
        };


    }
]);