'use strict';

// Contrôleur de la page de contact
flyWkAppControllers.controller('contactCtrl', ['$scope', '$http', 'Restangular',
    function($scope,$http,Restangular, $routeParams){

        //----------SOMEGLOBALFUNCTIONS-------------------
        $scope.orderBy = function(input, attribute) {
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
        $scope.printDuration = function (start, end) {
            if (start == "0") {
                console.log(end);
                return Math.floor(moment.duration(end).asHours()) + "h" + moment.utc(end).format('mm')+"m";
            }
            else
            {
                return Math.floor(moment.duration(moment(end).diff(start)).asHours()) + "h" + moment.utc(moment(end).diff(start)).format('mm')+"m";
            }
        }
        
        //----------SEARCHLAUNCH--------------------------
        $scope.refreshFlySearchData = function () {
            apiFlySearch.get().then(function(flySearchData) {
                $scope.travelData =[];
                $scope.flySearch = flySearchData;
                $scope.flySearch.placeTable = [];
                $scope.flySearch.dateTable = [];
                $scope.flySearch.minDuration = 0;
                $scope.flySearch.maxDuration = 10000;
                
                $scope.flySearch.searchType = 2;
                if ($scope.flySearch.subFlySearches[0].arrivalDate == "0000-00-00T00:00:00.000Z") {
                    $scope.flySearch.searchType = 1;
                }
                console.log($scope.flySearch.searchType);
                
                var i =0;  
                angular.forEach($scope.flySearch.subFlySearches, function(subFlySearch) {
                    //Definition of a table that will give the coordinates of the values in the summary table (html)
                    subFlySearch.coord = [];
                    subFlySearch.minPrice = 1000000;
                    subFlySearch.durationMinPrice = "";
                    //Concatenate Places together and dates together
                    subFlySearch.placeTable = subFlySearch.departure.code + subFlySearch.arrival.code;
                    subFlySearch.dateTable = subFlySearch.departureDate + subFlySearch.arrivalDate;
                    
                    //Find if the concatenatePlace were already used
                    if ($scope.flySearch.placeTable.indexOf(subFlySearch.placeTable) == -1) {
                        $scope.flySearch.placeTable.push(subFlySearch.placeTable);
                    }
                    //Find if the concatenateDate were already used
                    if ($scope.flySearch.dateTable.indexOf(subFlySearch.dateTable) == -1) {
                        $scope.flySearch.dateTable.push(subFlySearch.dateTable);
                    }
                    //Give back the coordinates
                    subFlySearch.coord[0] = $scope.flySearch.placeTable.indexOf(subFlySearch.placeTable);
                    subFlySearch.coord[1] = $scope.flySearch.dateTable.indexOf(subFlySearch.dateTable);
                    
                    if (subFlySearch.travels.length !==0 ) {
                        i=i+1;
                        angular.forEach(subFlySearch.travels, function(travel) {
                            if ( travel.flights.length !== 0 ) {

                                var outwardFlights = $scope.filterFlight(travel.flights,1,0);
                                var firstOutward = $scope.filterFlight(outwardFlights,0,1);
                                var lastOutward = $scope.filterFlight(outwardFlights,0,outwardFlights.length); 
                                if ($scope.flySearch.searchType == 2) {
                                    var inwardFlights = $scope.filterFlight(travel.flights,2,0);
                                    var firstInward = $scope.filterFlight(inwardFlights,0,1);
                                    var lastInward = $scope.filterFlight(inwardFlights,0,inwardFlights.length);
                                }

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
                                
                                if ($scope.flySearch.searchType == 2) {
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
                                }
                                
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
                                if (travel.duration > $scope.flySearch.maxDuration) {
                                    $scope.flySearch.maxDuration = travel.duration + 1;
                                    //console.log($scope.flySearch.maxDuration);
                                }
                                
                                //format arrows
                                travel.outwardTypeCss = outwardFlights.length;
                                if ($scope.flySearch.searchType == 2) {
                                    travel.inwardTypeCss = inwardFlights.length;
                                }
                                
                                //boutons et format box
                                $scope.increaseBox[travel.id] = false;
                                travel.showBtnsBool = false;
                                
                                // Calcul des détails des voyages (Durée, temps de correspondance)
                                var oldFlight = "";
                                var flightsData1 = $scope.orderBy(travel.flights, 'indice');
                                travel.flights = $scope.orderBy(flightsData1, 'wayType');
                                
                                angular.forEach(travel.flights, function(flight) {

                                    flight.duration = $scope.printDuration(flight.takeOffDate,flight.landDate);
                                    //console.log(flight.duration);
                                    flight.corespondanceDuration = "";

                                    if (oldFlight != ""){
                                        var correspondanceStart = oldFlight.landDate;
                                        var correspondanceEnd = flight.takeOffDate;
                                        flight.correspondanceDuration = $scope.printDuration(correspondanceStart,correspondanceEnd);
                                    }
                                    oldFlight = flight;

                                })

                                //$scope.travelData.push(travel);
                            }
                        })
                    }
                })
                 $scope.filter.duration = ($scope.flySearch.maxDuration);
                 $scope.filterFlySearchTravels();
            });
        }
        $scope.filterFlySearchTravels = function () {
            $scope.filterHistory(); 
            $scope.updateFilterBoxBtn();
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
                    if ($scope.filter.outwardTiming[0]>86400000) {
                        $scope.outwardNextDay[0] = "le lendemain ";
                    }
                    else 
                    {
                        if ($scope.filter.outwardTiming[1]>86400000) {
                            $scope.outwardNextDay[1] = "le lendemain ";
                        }
                    }
                    if ($scope.filter.inwardTiming[0]>86400000) {
                        $scope.inwardNextDay[0] = "le lendemain ";
                    }
                    else
                    {
                        if ($scope.filter.inwardTiming[1]>86400000) {
                            $scope.inwardNextDay[1] = "le lendemain ";
                        }
                    }


                    if (outwardTiming > $scope.filter.outwardTiming[1] || outwardTiming < $scope.filter.outwardTiming[0])
                    {
                        travel.showTravel = false;
                    }
                    if (inwardTiming > $scope.filter.inwardTiming[1] || outwardTiming < $scope.filter.inwardTiming[0])
                    {
                        travel.showTravel = false;
                    }
                    //suppression unitaire
                    
                    if ($scope.filter.hideTravel.indexOf(travel['@id']) > -1) {
                        travel.showTravel = false;
                    }

                    if (travel.showTravel) {
                        if (travel.minPrice < subFlySearch.minPrice) {
                            subFlySearch.minPrice = travel.minPrice;
                            subFlySearch.durationMinPrice = Math.max (travel.inwardDuration, travel.outwardDuration);
                        }
                    }
                    if ($scope.travelData.indexOf(travel) == -1) {
                         $scope.travelData.push(travel);
                    }
                    //$scope.travelData.push(travel);
                })
            })
            
        }
        $scope.filterHistory = function () {
            var length = $scope.oldFilter.length -1;
            
            if ($scope.lastFilterId == undefined || $scope.lastFilterId == length)
            {
                if ($scope.filter.duration !== $scope.oldFilter[length].duration) {
                    if ($scope.lastFilterType == "duration") {
                        $scope.oldFilter[length].duration = $scope.filter.duration;
                    }
                    else
                    {
                        $scope.oldFilter.push(angular.copy($scope.filter));
                        $scope.nextFilter = [];
                        $scope.lastFilterId++;
                        $scope.lastFilterType = "duration";
                    }
                }
                else
                {
                    if ($scope.filter.inwardTiming[0] !== $scope.oldFilter[length].inwardTiming[0] || $scope.filter.inwardTiming[1] !== $scope.oldFilter[length].inwardTiming[1] || $scope.filter.outwardTiming[0] !== $scope.oldFilter[length].outwardTiming[0] || $scope.filter.outwardTiming[1] !== $scope.oldFilter[length].outwardTiming[1] ) {
                        if ($scope.lastFilterType == "timing") {
                            $scope.oldFilter[length].inwardTiming = $scope.filter.inwardTiming;
                            $scope.oldFilter[length].outwardTiming = $scope.filter.outwardTiming;
                        }
                        else
                        {
                            $scope.oldFilter.push(angular.copy($scope.filter));
                            $scope.nextFilter = [];
                            $scope.lastFilterId++;
                            $scope.lastFilterType = "timing";
                        }
                    }
                    else
                    {
                        //Log for each of the hide travel
                         if ($scope.filter.hideTravel.length !== $scope.oldFilter[length].hideTravel.length) {
                            $scope.oldFilter.push(angular.copy($scope.filter));
                            $scope.nextFilter = [];
                            $scope.lastFilterId++;
                            $scope.lastFilterType = "hide travel";
                        }
                        else
                        {
                            if ($scope.filter.direct !== $scope.oldFilter[length].direct || $scope.filter.escale !== $scope.oldFilter[length].escale || $scope.filter.escales !== $scope.oldFilter[length].escales)
                            {
                                $scope.oldFilter.push(angular.copy($scope.filter));
                                $scope.nextFilter = [];
                                $scope.lastFilterId++;
                                $scope.lastFilterType = "flight Type";
                            }
                            
                        }
                    }
                }
            }
            else
            {
                $scope.nextFilter.push(angular.copy($scope.oldFilter[length]));
                $scope.oldFilter.splice(length);
            }
            

            
        }
        
        //----------TRAVELBOX--------------------------
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
        //used to order flights for a specific travel
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
        //function to get the flight type from the number of flight
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
        $scope.getTravelMinPrice = function (travel) {
            var minPrice = 1000000;
            angular.forEach(travel.prices, function(price) {
                if (price.price < minPrice) {
                    minPrice = price.price;
                }
            })
            return minPrice;
        }

        //----------COMPARISONBOX--------------------------
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

        //----------FILTERBOX--------------------------
        //functions
        $scope.cancelFilter = function () {
            $scope.hideDetailsFunction();
            $scope.hideHideBox();
            if ($scope.lastFilterId > 1) {
                $scope.filter = angular.copy($scope.oldFilter[$scope.lastFilterId-1]);
                $scope.lastFilterId = $scope.lastFilterId -1;
                $scope.filterFlySearchTravels();
            }
        }
        $scope.redoFilter = function () {
            if ($scope.nextFilter.length >0) {
                $scope.filter = angular.copy($scope.nextFilter[$scope.nextFilter.length - 1]);
                $scope.nextFilter.splice($scope.nextFilter.length - 1);
                $scope.filterFlySearchTravels();
            }
        }
        $scope.cancelRemove = function () {
            $scope.filter.hideTravel = [];
            $scope.filterFlySearchTravels();
            $scope.showHideBoxBool = false;
            $scope.showDetailsBool = false;
        }
        /*$scope.escaleCheckBoxChange = function () {
            if ( $scope.filter.escale == false && $scope.filter.direct == true)
            {
                $scope.filter.escales = false;
            }
            $scope.filterFlySearchTravels();
        }*/
        $scope.checkBoxChange = function (a) {
            switch (a) {
                case 0:
                    $scope.filter.direct = true;
                    $scope.filter.escale = true;
                    $scope.filter.escales = true;
                    break;
                case 1:
                    $scope.filter.direct = true;
                    $scope.filter.escale = true;
                    $scope.filter.escales = false;
                    break;
                case 2:
                    $scope.filter.direct = true;
                    $scope.filter.escale = false;
                    $scope.filter.escales = false;
                    break;
            }
            $scope.filterFlySearchTravels();
        }
        //Booleans
        $scope.filterBoxBtnStyle = {
            activeCancel: "disabled", 
            activeRedo : "disabled", 
            activeDirect : "btn-default", 
            activeEscale : "btn-default", 
            activeEscales : "btn-info",
            activeCancelDelete: "disabled"
        };
        $scope.updateFilterBoxBtn = function () {
            //boutons actives et desactives
            if ($scope.oldFilter.length >2) 
            {$scope.filterBoxBtnStyle.activeCancel= "";}
            else{$scope.filterBoxBtnStyle.activeCancel= "disabled";}
            if ($scope.nextFilter.length>0)
            {$scope.filterBoxBtnStyle.activeRedo= "";}
            else{$scope.filterBoxBtnStyle.activeRedo= "disabled";}
            if ($scope.filter.hideTravel.length >0)
            {$scope.filterBoxBtnStyle.activeCancelDelete= "";}
            else{$scope.filterBoxBtnStyle.activeCancelDelete= "disabled";}
            //boutons type de vol
            if ($scope.filter.escales == true)
            {$scope.filterBoxBtnStyle.activeEscales = "btn-info";
             $scope.filterBoxBtnStyle.activeDirect = "btn-default";
             $scope.filterBoxBtnStyle.activeEscale = "btn-default";}
            else
            {
                if ($scope.filter.escale == true)
                {$scope.filterBoxBtnStyle.activeEscale = "btn-info";
                 $scope.filterBoxBtnStyle.activeDirect = "btn-default";
                 $scope.filterBoxBtnStyle.activeEscales = "btn-default";}
                else {$scope.filterBoxBtnStyle.activeEscale = "btn-default";
                      $scope.filterBoxBtnStyle.activeEscales = "btn-default";
                      $scope.filterBoxBtnStyle.activeDirect = "btn-info";}
            }
        };
        
        //----------HIDEBOX--------------------------
        //HideBox Function
        $scope.showHideBoxBool = false;
        $scope.shortHideBoxBool = false;
        $scope.updateFilter = function (travel, a) {
            switch (a) {
                case 0:
                    var length = $scope.oldFilter.length -2;
                    $scope.filter.duration = $scope.oldFilter[length].duration;
                    $scope.filter.outwardTiming[0] = $scope.oldFilter[length].outwardTiming[0];
                    $scope.filter.outwardTiming[1] = $scope.oldFilter[length].outwardTiming[1];
                    $scope.filter.inwardTiming[0] = $scope.oldFilter[length].inwardTiming[0];
                    $scope.filter.inwardTiming[1] = $scope.oldFilter[length].inwardTiming[1];
                    $scope.filter.hideTravel.splice($scope.filter.hideTravel.indexOf(travel['@id']));
                    $scope.shortHideBoxBool = !$scope.shortHideBoxBool;
                case -1:
                    $scope.showHideBoxBool = false;
                    $scope.shortHideBoxBool = !$scope.shortHideBoxBool;
                    $scope.filter.hideTravel.splice($scope.filter.hideTravel.indexOf(travel['@id']));
                    break;
                case 1:
                    $scope.filter.duration = travel.duration - 1;
                    break;
                case 2:
                    $scope.filter.outwardTiming[0] = moment(travel.outwardTakeOffDate).diff($scope.flySearch.subFlySearches[travel.subFlySearchParent-1].departureDate)+1;
                    break;
                case 3:
                    $scope.filter.outwardTiming[0] = moment(travel.outwardTakeOffDate).diff($scope.flySearch.subFlySearches[travel.subFlySearchParent-1].departureDate)+1;
                    break;
                case 4:
                    $scope.filter.outwardTiming[1] = moment(travel.outwardTakeOffDate).diff($scope.flySearch.subFlySearches[travel.subFlySearchParent-1].departureDate)-1;
                    break;
                case 5:
                    $scope.filter.inwardTiming[0] = moment(travel.inwardTakeOffDate).diff($scope.flySearch.subFlySearches[travel.subFlySearchParent-1].arrivalDate)+1;
                    break;
                case 6:
                    $scope.filter.inwardTiming[1] = moment(travel.inwardTakeOffDate).diff($scope.flySearch.subFlySearches[travel.subFlySearchParent-1].arrivalDate)-1;
                    break;
            }
            
            $scope.shortHideBoxBool = !$scope.shortHideBoxBool;
            $scope.filterFlySearchTravels();
            
        }
        $scope.showHideBox = function (travel,$event) {
            $scope.hideDetailsFunction();
            if ($event !== undefined) {
                $scope.showHideInfoOffset = angular.element($event.currentTarget).prop('offsetParent').offsetTop;
                if ($scope.showHideInfoOffset < 100) {
                    $scope.showHideInfoOffset = $scope.showDetailsOffset;
                }
            }
            //remove record
            $scope.filter.hideTravel.push(travel['@id']);
            //show the box
            $scope.showHideBoxBool = true;
            $scope.selectedTravel = travel;
            $scope.filterFlySearchTravels();
            //$scope.oldFilter = angular.copy($scope.filter);
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
        $scope.hideHideBox = function () {
            $scope.showHideBoxBool = false;
        }
        
        //----------DETAILSBOX--------------------------
        $scope.showDetailsBool = false;
        $scope.hideDetailsFunction = function () {
            $scope.showDetailsBool = false;
            $scope.increaseBox[$scope.selectedTravel.id] = false;
        }
        $scope.showDetailsFunction = function (travel,$event) {
            $scope.hideHideBox();
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

        //----------INITIALISATION DES VARIABLES----------------
        $scope.flySearch = {};
        $scope.selectedTravel ="";
        $scope.travelData =[];
        $scope.increaseBox = [];
        $scope.showDetailsOffset = 0;
        $scope.outwardNextDay = ["",""];
        $scope.inwardNextDay = ["",""];
        $scope.filter = {
            direct : true,
            escale : true,
            escales : true,
            duration : "1000",
            maxTiming : 172799999,
            outwardTiming: [0, 86400000-1],
            inwardTiming : [0, 86400000-1],
            hideTravel: []
        }
        $scope.oldFilter= [];
        $scope.oldFilter.push(angular.copy($scope.filter));
        $scope.nextFilter= [];
        $scope.lastFilterId = 0;
        $scope.lastFilterType = "hide travel";
        
        //----------LANCEMENT DU CODE--------------------------
        var apiFlySearch = Restangular.one('api/fly_searches', 10); 
        $scope.refreshFlySearchData();

    
    
    
    }
]);