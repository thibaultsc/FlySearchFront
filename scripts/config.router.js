'use strict';

/**
 * Configuration du module principal : flyWkApp
 */
flyWkApp.config(['$routeProvider',
    function($routeProvider) { 
        
        // Système de routage
        $routeProvider
        .when('/search', {
            templateUrl: 'views/search.html',
            controller: 'searchCtrl'
        })
        .when('/contact/:msg?', {
            templateUrl: 'views/contact.html',
            controller: 'contactCtrl'
        })
        .otherwise({
            redirectTo: '/search'
        });
    }
]);
