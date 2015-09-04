'use strict';

// Contrôleur de la page de contact
flyWkAppControllers.controller('contactCtrl', ['$scope', '$http', 'Restangular',
    function($scope,$http,Restangular, $routeParams){

        //récupération des résultats de recherche
        var apiFlySearch = Restangular.one('api/fly_searches', 5); //Restangular.all('api/fly_searches/5');
        
        //initialisation des variables
        $scope.flySearch = {};
        $scope.showDetailsBool = false;
        $scope.selectedTravel ="";
        $scope.travelData =[];
        $scope.increaseBox = [];
        $scope.showDetailsOffset = 0;
        
        $scope.refreshFlySearchData = function () {
            console.log('presse');
            apiFlySearch.get().then(function(flySearchData) {
                $scope.travelData =[];
                $scope.flySearch = flySearchData;
                $scope.flySearch.placeTable = [];
                $scope.flySearch.dateTable = [];
                $scope.flySearch.directCheckBox = true;
                $scope.flySearch.escaleCheckBox = true;
                $scope.flySearch.escalesCheckBox = true;
                //$scope.flySearch.duration = 100;
                $scope.flySearch.minDuration = 0;
                $scope.flySearch.maxDuration = 0;
                
                var i =0;  
                //console.log($scope.flySearch.placeTable);
                angular.forEach($scope.flySearch.subFlySearches, function(subFlySearch) {
                    //Definition of a table that will give the coordinates of the values in the summary table (html)
                    subFlySearch.coord = [];
                    subFlySearch.minPrice =1000000;
                    subFlySearch.durationMinPrice = "";
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
                    subFlySearch.coord[1] = $scope.flySearch.dateTable.indexOf(subFlySearch.dateTable);
                    //$scope.flySearch.coordinateTable[subFlySearch.coord[0]][subFlySearch.coord[1]] = subFlySearch['@id'];
                    //console.log('suite');
                    //console.log(subFlySearch.coord);
                    //console.log($scope.flySearch.coordinateTable);
                    
                    if (subFlySearch.travels.length !==0 ) {
                        i=i+1;
                        angular.forEach(subFlySearch.travels, function(travel) {
                            if ( travel.flights.length !== 0 ) {

                                var outwardFlights = $scope.filterFlight(travel.flights,1,0);
                                var firstOutward = $scope.filterFlight(outwardFlights,0,1);
                                var lastOutward = $scope.filterFlight(outwardFlights,0,outwardFlights.length);                                 
                                var inwardFlights = $scope.filterFlight(travel.flights,2,0);
                                var firstInward = $scope.filterFlight(inwardFlights,0,1);
                                var lastInward = $scope.filterFlight(inwardFlights,0,inwardFlights.length);
                                
                                //Rajout des attributs métiers
                                travel.subFlySearchParent = (i);
                                
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
                                travel.outwardTypeValue = outwardFlights.length;
                                travel.outwardDuration = moment(travel.outwardLandDate).diff(travel.outwardTakeOffDate);
                                
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
                                travel.inwardTypeValue = inwardFlights.length;
                                travel.inwardDuration = moment(travel.inwardLandDate).diff(travel.inwardTakeOffDate);
                                
                                //PURCHASE INFO
                                travel.airline = $scope.getTravelAirlines(travel);
                                travel.minPrice = $scope.getTravelMinPrice(travel);
                                

                                travel.id = travel['@id'].substring(travel['@id'].lastIndexOf("/")+1,  travel['@id'].length);
                                
                                
                                //calcul des durée et mise à jour des bornes de durée pour filtre
                                travel.duration = Math.max (travel.inwardDuration, travel.outwardDuration);
                                
                                if (travel.duration < $scope.flySearch.minDuration  || $scope.flySearch.minDuration == 0) {
                                    $scope.flySearch.minDuration = travel.duration;
                                    //console.log($scope.flySearch.minDuration);
                                }
                                if (travel.duration > $scope.flySearch.maxDuration || $scope.flySearch.maxDuration == 0) {
                                    $scope.flySearch.maxDuration = travel.duration;
                                    //console.log($scope.flySearch.maxDuration);
                                }
                                $scope.flySearch.duration = $scope.flySearch.maxDuration;
                                
                                
                                //format arrows
                                travel.outwardTypeCss = outwardFlights.length;
                                travel.inwardTypeCss = inwardFlights.length;
                                
                                // Calcul des détails des voyages (Durée, temps de correspondance)
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

                                //$scope.travelData.push(travel);
                            }
                        })
                    }
                })
                 
                 $scope.filterFlySearchTravels();
                //$scope.updateTravelData();
            });
        };
        //Make sure that 2 stops gets uncheck when you uncheck 1 stop
        $scope.escaleCheckBoxChange = function () {
            if ( $scope.flySearch.escaleCheckBox == false && $scope.flySearch.directCheckBox == true)
            {
                $scope.flySearch.escalesCheckBox = false;
            }
            $scope.filterFlySearchTravels();
        }
        
        $scope.filterFlySearchTravels = function () {
            $scope.travelData =[];
            $scope.flySearch.dataDuration = [0,0,0,0,0,0,0,0,0,0];
            angular.forEach($scope.flySearch.subFlySearches,function(subFlySearch) {
                subFlySearch.minPrice = 1000000;
                subFlySearch.durationMinPrice = "";
                angular.forEach(subFlySearch.travels,function(travel) {

                    //Filtre sur vol Direct / 1 Escale / 2 Escales
                    if (travel.inwardTypeValue == 1 && travel.outwardTypeValue == 1) {
                        travel.showTravel = $scope.flySearch.directCheckBox;
                        //console.log (travel.inwardTypeValue);
                    }
                    else {
                        if (travel.inwardTypeValue <3 && travel.outwardTypeValue <3) {
                            travel.showTravel = $scope.flySearch.escaleCheckBox;
                        }
                        else {
                            travel.showTravel = $scope.flySearch.escalesCheckBox;
                        }
                    }
                    
                    //Filtre sur la durée
                    //console.log(travel.duration + "   " + $scope.flySearch.duration);
                    var z = Math.floor((travel.duration - $scope.flySearch.minDuration) / ($scope.flySearch.maxDuration + 1 - $scope.flySearch.minDuration)*$scope.flySearch.dataDuration.length);
                    $scope.flySearch.dataDuration[z] = $scope.flySearch.dataDuration[z] +1;
                    if ( travel.duration > $scope.flySearch.duration)
                    {
                        travel.showTravel = false;
                    }
                    console.log($scope.flySearch.dataDuration);
                    
                    
                    $scope.labels = ['', '', '', '', '','', '', '', '', ''];
                    //$scope.series = [''];
                    $scope.options = {
                    scaleShowGridLines : false,
                    scaleShowLabels: false,
                    scaleLineColor: "rgba(0,0,0,0)",
                     showTooltips: false,
                    barStrokeWidth : 0,
                    barValueSpacing : 0,
                    maintainAspectRatio: true}
                    $scope.data = [];
                    $scope.data.push($scope.flySearch.dataDuration);          

                    
                    
                    if (travel.showTravel) {
                        if (travel.minPrice < subFlySearch.minPrice) {
                            subFlySearch.minPrice = travel.minPrice;
                            subFlySearch.durationMinPrice = Math.max (travel.inwardDuration, travel.outwardDuration);
                        }
                    }
                    $scope.travelData.push(travel);
                    
                })
            })
            $scope.updateTravelData();
        }
        
        $scope.getNumber = function(num) {
            var Table =[];  
            for (var i=0;i<num;i++) {
            Table[i]=i;
            }
            return Table;
        }
        
        $scope.getFlySearchDates = function (i){
            var a = 'gh';
            var b="";
            angular.forEach($scope.flySearch.subFlySearches, function(subFlySearch) {
                if (subFlySearch == undefined) {
                return 'error';
                }
                if (subFlySearch.coord[1] == i) {
                    //console.log(subFlySearch.departureDate);
                    a = moment(subFlySearch.departureDate).format('DD MMM');
                    b = moment(subFlySearch.arrivalDate).format('DD MMM');
                    //return '0';
                }
            })
            return [a, b];
        }
        
        $scope.getFlySearchPlaces = function (i){
            var a = 'gh';
            angular.forEach($scope.flySearch.subFlySearches, function(subFlySearch) {
                if (subFlySearch == undefined) {
                return 'error';
                }
                if (subFlySearch.coord[0] == i) {
                    //console.log(subFlySearch.departureDate);
                    a = subFlySearch.departure.name +" - "+subFlySearch.arrival.name;
                    //return '0';
                }
            })
            return a;
        }
        
        $scope.getFlySearchMinPrices = function (i,j){
            var a = 'x';
            var b ="";
            var c="";
            angular.forEach($scope.flySearch.subFlySearches, function(subFlySearch) {
                if (subFlySearch == undefined) {
                return 'error';
                }
                if (subFlySearch.coord[0] == j) {
                    //console.log(subFlySearch.coord);
                    if (subFlySearch.coord[1] == i) {
                        //console.log('nok');
                        //console.log(subFlySearch.departureDate);
                        a = subFlySearch.minPrice + " €" ;
                        b = subFlySearch.durationMinPrice;
                        //return '0';
                    }
                }
            })
            c = Math.floor(moment.duration(b).asHours()) + "h" + moment.utc(b).format('mm')+"m";
            if (a=="1000000 €") {a = "x"; c=""}
            return [a,c];
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
        
        $scope.getTravelAirlines = function (travel) {
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
        
        $scope.getTravelMinPrice = function (travel) {
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
                //$scope.showBtnsBool[travel.id] = false;
                $scope.increaseBox[travel.id] = false;
                travel.showBtnsBool = false;
                //print Duration
                travel.outwardDurationPrint = Math.floor(moment.duration(travel.outwardDuration).asHours()) + "h" + moment.utc(travel.outwardDuration).format('mm')+"m";
                travel.inwardDurationPrint = Math.floor(moment.duration(travel.inwardDuration).asHours()) + "h" + moment.utc(travel.inwardDuration).format('mm')+"m";
                
            })
        };
        
        $scope.refreshFlySearchData();
    }
]);