'use strict';

// Contrôleur de la page de contact
flyWkAppControllers.controller('contactCtrl', ['$scope', '$http', 'Restangular',
    function($scope,$http,Restangular, $routeParams){

        var apiAirports = Restangular.one('api/fly_searches', 5); //Restangular.all('api/fly_searches/5');
        //var $scope.travelData = [];
        
        
        $scope.flySearch = {};
        
        $scope.refreshFlySearchData = function () {
            apiAirports.get().then(function(flySearchData) {
                $scope.flySearch = flySearchData;
                $scope.travelData = $scope.flySearch.subFlySearches[0].travels;
                $scope.updateTravelData();
            });
        };
        
        $scope.filterFlight = function (flights, wayType,indice) {
            var filteredFlights = [];
            angular.forEach(flights, function(flight) {
                if (flight.wayType == wayType) {
                    filteredFlights.push(flight);
                }
                if (flight.indice == indice) {
                    filteredFlights.push(flight);
                }
            })
            return filteredFlights;
        }
        
        $scope.getAirlines = function (travel) {
            var airlines = [];
            travel.airlinetext = "";
            angular.forEach(travel.flights, function(flight) {
                
                if (airlines.indexOf(flight.airline) == -1) {
                    airlines.push(flight.airline);
                }
            })
            angular.forEach(airlines, function(airline) {
                if (travel.airlinetext == "") {
                    travel.airlinetext = airline;
                } 
                else {
                    travel.airlinetext = travel.airlinetext + " + " + airline;
                }
            })
            return travel.airlinetext;
        }
        
        $scope.getPrice = function (travel) {
            var minPrice = 1000000;
            angular.forEach(travel.prices, function(price) {
                
                if (price < minPrice) {
                    minPrice = price;
                }
            })
            return minPrice;
        }

        $scope.TypeFunction = function (nbFlights) {
            if (nbFlights.length == 1) {
                return "Direct";
            }
            if (nbFlights.length == 2) {
                return "1 escale";
            }
            if (nbFlights.length == 3) {
                return "2 escales";
            }
        }
        
        
        $scope.updateTravelData = function () {
            angular.forEach($scope.flySearch.subFlySearches[0].travels, function(travel) {
                
                var outwardFlights = $scope.filterFlight(travel.flights,1,0);
                var firstOutward = $scope.filterFlight(outwardFlights,0,1);
                var lastOutward = $scope.filterFlight(outwardFlights,0,outwardFlights.length);                                 
                var inwardFlights = $scope.filterFlight(travel.flights,2,0);
                var firstInward = $scope.filterFlight(inwardFlights,0,1);
                var lastInward = $scope.filterFlight(inwardFlights,0,inwardFlights.length);
                
                // OUTWARD FLIGHT
                // Info about departure
                travel.outwardTakeOffDate = firstOutward[0].takeOffDate;
                travel.outwardDeparture = firstOutward[0].departure;
                //Info about arrival
                travel.outwardLandDate = lastOutward[0].landDate;
                travel.outwardDayDiff = moment(travel.outwardLandDate).date() - moment(travel.outwardTakeOffDate).date();
                travel.outwardArrival = lastOutward[0].arrival;
                //Global duration & type of flight
                travel.outwardType = $scope.TypeFunction(outwardFlights);
                travel.outwardDuration = Math.floor(moment.duration(moment(travel.outwardLandDate).diff(travel.outwardTakeOffDate)).asHours()) + "h" + moment.utc(moment(travel.outwardLandDate).diff(travel.outwardTakeOffDate)).format('mm');
                
                // INWARD FLIGHT
                // Info about departure
                travel.inwardTakeOffDate = firstInward[0].takeOffDate;
                travel.inwardDeparture = firstInward[0].departure;
                //Info about arrival
                travel.inwardLandDate = lastInward[0].landDate;
                travel.inwardDayDiff = moment(travel.inwardLandDate).date() - moment(travel.inwardTakeOffDate).date();
                travel.inwardArrival = lastInward[0].arrival;
                //Global duration & type of flight
                travel.inwardType = $scope.TypeFunction(inwardFlights);
                travel.inwardDuration = Math.floor(moment.duration(moment(travel.inwardLandDate).diff(travel.inwardTakeOffDate)).asHours()) + "h" + moment.utc(moment(travel.inwardLandDate).diff(travel.inwardTakeOffDate)).format('mm');
                
                //PURCHASE INFO
                travel.airline = $scope.getAirlines(travel);
                travel.price = $scope.getPrice(travel);
                
            })

        };
        
        $scope.refreshFlySearchData();
    }
]);