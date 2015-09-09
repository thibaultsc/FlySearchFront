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
        $scope.outwardNextDay = ["",""];
        $scope.inwardNextDay = ["",""];
        

        $scope.refreshFlySearchData = function () {
            //console.log('presse');
            apiFlySearch.get().then(function(flySearchData) {
                $scope.travelData =[];
                $scope.flySearch = flySearchData;
                $scope.flySearch.placeTable = [];
                $scope.flySearch.dateTable = [];
                $scope.flySearch.minDuration = 0;
                $scope.flySearch.maxDuration = 10000;
                
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
                                travel.hide = [false,false,false,false,false,false,false,false];
                                
                                
                                //calcul des durée et mise à jour des bornes de durée pour filtre
                                travel.duration = Math.max (travel.inwardDuration, travel.outwardDuration);
                                
                                if (travel.duration < $scope.flySearch.minDuration  || $scope.flySearch.minDuration == 0) {
                                    $scope.flySearch.minDuration = travel.duration;
                                    //console.log($scope.flySearch.minDuration);
                                }
                                if (travel.duration > $scope.flySearch.maxDuration) {
                                    $scope.flySearch.maxDuration = travel.duration;
                                    //console.log($scope.flySearch.maxDuration);
                                }
                                
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
                 $scope.filter.duration = $scope.flySearch.maxDuration.toString();
                 $scope.filterFlySearchTravels();
                //$scope.updateTravelData();
            });
        };
        //Make sure that 2 stops gets uncheck when you uncheck 1 stop
        
        
        $scope.escaleCheckBoxChange = function () {
            if ( $scope.filter.escale == false && $scope.filter.direct == true)
            {
                $scope.filter.escales = false;
            }
            $scope.filterFlySearchTravels();
        }
        
        
        $scope.filter = {
            direct : true,
            escale : true,
            escales : true,
            duration : "1000",
            maxTiming : 172799999,
            outwardTiming: [0, 86400000-1],
            inwardTiming : [0, 86400000-1]
        }

        
        
        $scope.filterFlySearchTravels = function () {
            $scope.travelData =[];
            $scope.outwardNextDay = ["",""];
            $scope.inwardNextDay = ["",""];
            $scope.flySearch.dataDuration = [0,0,0,0,0,0,0,0,0,0];
            angular.forEach($scope.flySearch.subFlySearches,function(subFlySearch) {
                subFlySearch.minPrice = 1000000;
                subFlySearch.durationMinPrice = "";
                angular.forEach(subFlySearch.travels,function(travel) {

                    //Filtre sur vol Direct / 1 Escale / 2 Escales
                    if (travel.inwardTypeValue == 1 && travel.outwardTypeValue == 1) {
                        travel.showTravel = $scope.filter.direct;
                        //console.log (travel.inwardTypeValue);
                    }
                    else {
                        if (travel.inwardTypeValue <3 && travel.outwardTypeValue <3) {
                            travel.showTravel = $scope.filter.escale;
                        }
                        else {
                            travel.showTravel = $scope.filter.escales;
                        }
                    }
                    
                    //Filtre sur la durée
                    //console.log(travel.duration + "   " + $scope.flySearch.duration);
                    var z = Math.floor((travel.duration - $scope.flySearch.minDuration) / ($scope.flySearch.maxDuration + 1 - $scope.flySearch.minDuration)*$scope.flySearch.dataDuration.length);
                    $scope.flySearch.dataDuration[z] = $scope.flySearch.dataDuration[z] +1;
                    if ( travel.duration > $scope.filter.duration)
                    {
                        travel.showTravel = false;
                    }
                    
                    //Chart to display flights
                    $scope.labels = ['', '', '', '', '','', '', '', '', ''];
                    $scope.options = { scaleShowGridLines : false,scaleShowLabels: false, scaleLineColor: "rgba(0,0,0,0)",showTooltips: false,barStrokeWidth : 0,barValueSpacing : 0,maintainAspectRatio: true}
                    $scope.data = [];
                    $scope.data.push($scope.flySearch.dataDuration);   
                    
                    
                    //Filter timing
                    var outwardTiming = moment(travel.outwardTakeOffDate).diff(subFlySearch.departureDate);
                    var inwardTiming = moment(travel.inwardTakeOffDate).diff(subFlySearch.arrivalDate);
                    //calculation above is the difference in UTC between the search date and the takeoffdate
                    
                    //display text inwardTiming > 24 h
                    if ($scope.filter.outwardTiming[1]>86400000) {
                        $scope.outwardNextDay[1] = "le lendemain ";
                    }
                    
                    if ($scope.filter.inwardTiming[1]>86400000) {
                        $scope.inwardNextDay[1] = "le lendemain ";
                    }
                    if ($scope.filter.outwardTiming[0]>86400000) {
                        $scope.outwardNextDay[0] = "le lendemain ";
                    }
                    
                    if ($scope.filter.inwardTiming[0]>86400000) {
                        $scope.inwardNextDay[0] = "le lendemain ";
                    }
                    
                    if (outwardTiming > $scope.filter.outwardTiming[1] || outwardTiming < $scope.filter.outwardTiming[0])
                    {
                        travel.showTravel = false;
                    }
                    if (inwardTiming > $scope.filter.inwardTiming[1] || outwardTiming < $scope.filter.inwardTiming[0])
                    {
                        travel.showTravel = false;
                    }

                    if (travel.hide[0] == true) {
                        travel.showTravel = false;
                    }

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
        $scope.updateFilter = function (travel, a) {
            //usine a gaz simplifiable si on garde dans la situation existante
            switch (a) {
                    
                case 0:
                    $scope.showHideInfoBool = false;
                    $scope.filter.duration = $scope.oldFilter.duration;
                    $scope.filter.outwardTiming[0] = $scope.oldFilter.outwardTiming[0];
                    $scope.filter.outwardTiming[1] = $scope.oldFilter.outwardTiming[1];
                    $scope.filter.inwardTiming[0] = $scope.oldFilter.inwardTiming[0];
                    $scope.filter.inwardTiming[1] = $scope.oldFilter.inwardTiming[1];
                    
                    travel.hide[0] = !travel.hide[0];
                    travel.hide[7] = !travel.hide[7];
                    travel.hide[1] = false;
                    travel.hide[2] = false;
                    travel.hide[3] = false;
                    travel.hide[4] = false;
                    travel.hide[5] = false;
                    travel.hide[6] = false;
                case -1:
                    $scope.showHideInfoBool = false;
                    travel.hide[7] = !travel.hide[7];
                    travel.hide[0] = !travel.hide[0];
                    break;
                case 1:
                    if (!travel.hide[a]) {
                        $scope.filter.duration = travel.duration - 1;
                    }
                    else
                    {
                        $scope.filter.duration = $scope.oldFilter.duration;
                    }
                    break;
                case 2:
                    if (!travel.hide[a]) {
                        $scope.filter.outwardTiming[0] = moment(travel.outwardTakeOffDate).diff($scope.flySearch.subFlySearches[travel.subFlySearchParent-1].departureDate)+1;
                    }
                    else
                    {
                        $scope.filter.outwardTiming[0] = $scope.oldFilter.outwardTiming[0];
                    }
                    break;
                case 3:
                    if (!travel.hide[a]) {
                        $scope.filter.outwardTiming[0] = moment(travel.outwardTakeOffDate).diff($scope.flySearch.subFlySearches[travel.subFlySearchParent-1].departureDate)+1;
                    }
                    else
                    {
                        $scope.filter.outwardTiming[0] = $scope.oldFilter.outwardTiming[0];
                    }
                    break;
                case 4:
                    if (!travel.hide[a]) {
                        $scope.filter.outwardTiming[1] = moment(travel.outwardTakeOffDate).diff($scope.flySearch.subFlySearches[travel.subFlySearchParent-1].departureDate)-1;
                    }
                    else
                    {
                        $scope.filter.outwardTiming[1] = $scope.oldFilter.outwardTiming[1];
                    }
                    
                    break;
                case 5:
                    if (!travel.hide[a]) {
                        $scope.filter.inwardTiming[0] = moment(travel.inwardTakeOffDate).diff($scope.flySearch.subFlySearches[travel.subFlySearchParent-1].arrivalDate)+1;
                    }
                    else
                    {
                        $scope.filter.inwardTiming[0] = $scope.oldFilter.inwardTiming[0];
                    }
                    
                    break;
                case 6:
                    if (!travel.hide[a]) {
                        $scope.filter.inwardTiming[1] = moment(travel.inwardTakeOffDate).diff($scope.flySearch.subFlySearches[travel.subFlySearchParent-1].arrivalDate)-1;
                    }
                    else
                    {
                        $scope.filter.inwardTiming[1] = $scope.oldFilter.inwardTiming[1];
                    }
                    
                    break;
            }
            travel.hide[a] = !travel.hide[a];
            travel.hide[7] = !travel.hide[7];
            
            $scope.filterFlySearchTravels();
            
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

            if ($event !== undefined) {
                //Get back the vertical offset of the selected travel to align the details travel box
                $scope.showDetailsOffset = angular.element($event.currentTarget).prop('offsetParent').offsetTop;
            }
            //increase the size of the travel box
            $scope.increaseBox[travel.id] = true;
            //update the new selectedTravel value
            $scope.selectedTravel = travel;
        }
        
        $scope.showHideProposition = function (travel,$event) {
            
            $scope.hideDetailsFunction();
            
            if ($event !== undefined) {
                //Get back the vertical offset of the selected travel to align the details travel box
                $scope.showHideInfoOffset = angular.element($event.currentTarget).prop('offsetParent').offsetTop;
            }
            
            //update the new selectedTravel value
            travel.hide[0] = true;
            $scope.selectedTravel = travel;
            $scope.showHideInfoBool = true;
            $scope.filterFlySearchTravels();
            $scope.oldFilter = angular.copy($scope.filter);
            
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
                travel.durationPrint = Math.floor(moment.duration(travel.duration).asHours()) + "h" + moment.utc(travel.duration).format('mm')+"m";
            })
            
        };
        
        $scope.refreshFlySearchData();
    }
]);