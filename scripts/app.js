'use strict';


/**
 * Déclaration de l'application flyWkApp
 */
var flyWkApp = angular
    .module('flyWkApp', [
                        'ngRoute',
                        'flyWkAppControllers',
                        'ui.bootstrap.datepicker',
                        'ngSanitize',
                        'ui.select',
                        'restangular'
    ])
;


/**
 * Définition des contrôleurs
 */
var flyWkAppControllers = angular.module('flyWkAppControllers', []);