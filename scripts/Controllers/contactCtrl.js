'use strict';

// Contrôleur de la page de contact
flyWkAppControllers.controller('contactCtrl', ['$scope', '$http', 'Restangular',
    function($scope,$http,Restangular, $routeParams){

        var apiAirports = Restangular.one('api/fly_searches', 5); //Restangular.all('api/fly_searches/5');
        //var $scope.travelData = [];
        
        
        $scope.flySearch = {};
        $scope.showDetailsBool = false;
        $scope.selectedTravel ="";
        $scope.travelData =[];
        $scope.increaseBox = [];
        $scope.showDetailsOffset = 0;
        
        
        $scope.refreshFlySearchData = function () {
            apiAirports.get().then(function(flySearchData) {
                $scope.travelData =[];
                $scope.flySearch = flySearchData;
                $scope.flySearch.placeTable = [];
                $scope.flySearch.dateTable = [];
                $scope.flySearch.coordinateTable = [[]];
                
                var i =0;  
                //console.log($scope.flySearch.placeTable);
                angular.forEach($scope.flySearch.subFlySearches, function(subFlySearch) {
                    //Definition of a table that will give the coordinates of the values in the summary table (html)
                    subFlySearch.coord = [];
                    //Concatenate Places together and dates together
                    subFlySearch.placeTable = subFlySearch.departure.code + subFlySearch.arrival.code;
                    subFlySearch.dateTable = subFlySearch.departureDate + subFlySearch.arrivalDate;
                    
                    //Find if the concatenatePlace were already used
                    if ($scope.flySearch.placeTable.indexOf(subFlySearch.placeTable) == -1) {
                        //console.log($scope.flySearch.placeTable.indexOf(subFlySearch.placeTable));
                        $scope.flySearch.placeTable.push(subFlySearch.placeTable);
                        //console.log($scope.flySearch.placeTable);
                    }
                    //Find if the concatenateDate were already used
                    if ($scope.flySearch.dateTable.indexOf(subFlySearch.dateTable) == -1) {
                        //console.log($scope.flySearch.placeTable.indexOf(subFlySearch.placeTable));
                        $scope.flySearch.dateTable.push(subFlySearch.dateTable);
                        //console.log($scope.flySearch.dateTable);
                    }
                    //Give back the coordinates
                    subFlySearch.coord[0] = $scope.flySearch.placeTable.indexOf(subFlySearch.placeTable);
                    subFlySearch.coord[0] = $scope.flySearch.dateTable.indexOf(subFlySearch.dateTable);
                    //$scope.flySearch.coordinateTable[subFlySearch.coord[0]][subFlySearch.coord[1]] = subFlySearch['@id'];
                    //console.log(subFlySearch.coord);
                    //console.log($scope.flySearch.coordinateTable);
                    
                    if (subFlySearch.travels.length !==0 ) {
                        i=i+1;
                        angular.forEach(subFlySearch.travels, function(travel) {
                            if ( travel.flights.length !== 0 ) {
                                travel.subFlySearchParent = (i);
                                
                                $scope.travelData.push(travel);
                            }
                        })
                    }
                })
                $scope.updateTravelData();
            });
        };
        $scope.getNumber = function(num) {
            var Table =[];  
            for (var i=0;i<num;i++) {
            Table[i]=i;
            }
            return Table;
        }
        $scope.getDates = function (i){
            var a = 0;
            angular.forEach($scope.flySearch.subFlySearches, function(subFlySearch) {
                if (subFlySearch == undefined) {
                return 'error';
                }
                if (subFlySearch.coord[0] == i) {
                    console.log(subFlySearch.departureDate);
                    a = subFlySearch.departureDate ;
                    //return '0';
                }
                
                return a;
            })
        }
        
        
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
                if (price.price < minPrice) {
                    minPrice = price.price;
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
        
        $scope.showDetailsFunction = function (travel,$event) {
            if (travel.id !== $scope.selectedTravel.id) {
                //Decrease the size of the previous selected travel box
                $scope.increaseBox[$scope.selectedTravel.id] = false;
            }
            //Show the details box
            $scope.showDetailsBool = true;
            //console.log($event);
            if ($event !== undefined) {
                //Get back the vertical offset of the selected travel to align the details travel box
                $scope.showDetailsOffset = angular.element($event.currentTarget).prop('offsetTop');
            }
            //increase the size of the travel box
            $scope.increaseBox[travel.id] = true;
            //update the new selectedTravel value
            $scope.selectedTravel = travel;
            //Show the buttons on the selected travels.
            $scope.showBtnsFunction(travel);
        }
        $scope.showBtnsFunction = function (travel) {
            //console.log(travel['@id']);
            travel.showBtnsBool = true;
            //id = travel['@id'].substring(travel['@id'].lastIndexOf("/")+1,  travel['@id'].length);
            //console.log(travel.id);
            //$scope.showBtnsBool[travel.id] = true;
        }
        $scope.hideBtnsFunction = function (travel) {
            //$scope.showBtnsBool[travel.id] = false;
            travel.showBtnsBool = false;
        }
        $scope.hideDetailsFunction = function () {
            $scope.showDetailsBool = false;
            $scope.increaseBox[$scope.selectedTravel.id] = false;
        }
        
       $scope.orderByFunction = function(input, attribute) {
            if (!angular.isObject(input)) return input;

            var array = [];
            for(var objectKey in input) {
                array.push(input[objectKey]);
            }

            array.sort(function(a, b){
                a = parseInt(a[attribute]);
                b = parseInt(b[attribute]);
                return a - b;
            });
            return array;
        }
        
        
        $scope.updateTravelData = function () {
            angular.forEach($scope.travelData, function(travel) {

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
                travel.outwardTypeCss = outwardFlights.length;
                travel.outwardDuration = Math.floor(moment.duration(moment(travel.outwardLandDate).diff(travel.outwardTakeOffDate)).asHours()) + "h" + moment.utc(moment(travel.outwardLandDate).diff(travel.outwardTakeOffDate)).format('mm')+"m";
                
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
                travel.inwardTypeCss = inwardFlights.length;
                travel.inwardDuration = Math.floor(moment.duration(moment(travel.inwardLandDate).diff(travel.inwardTakeOffDate)).asHours()) + "h" + moment.utc(moment(travel.inwardLandDate).diff(travel.inwardTakeOffDate)).format('mm')+"m";
                
                //PURCHASE INFO
                travel.airline = $scope.getAirlines(travel);
                travel.minprice = $scope.getPrice(travel);
                
                travel.id = travel['@id'].substring(travel['@id'].lastIndexOf("/")+1,  travel['@id'].length);
                //$scope.showBtnsBool[travel.id] = false;
                $scope.increaseBox[travel.id] = false;
                travel.showBtnsBool = false;
                
                var oldFlight = "";
                var flightsData1 = $scope.orderByFunction(travel.flights, 'indice');
                travel.flights = $scope.orderByFunction(flightsData1, 'wayType');
                
                angular.forEach(travel.flights, function(flight) {
                    
                    flight.duration = Math.floor(moment.duration(moment(flight.landDate).diff(flight.takeOffDate)).asHours()) + "h" + moment.utc(moment(flight.landDate).diff(flight.takeOffDate)).format('mm')+"m";
                    //console.log(flight.duration);
                    flight.corespondanceDuration = "";
                    
                    if (oldFlight != ""){
                        var correspondanceStart = oldFlight.landDate;
                        var correspondanceEnd = flight.takeOffDate;
                        flight.correspondanceDuration = Math.floor(moment.duration(moment(correspondanceEnd).diff(correspondanceStart)).asHours()) + "h" + moment.utc(moment(correspondanceEnd).diff(correspondanceStart)).format('mm')+"m"; 
                    }
                    oldFlight = flight;
                    
                })
                
            })

        };
        
        $scope.refreshFlySearchData();
    }
]);