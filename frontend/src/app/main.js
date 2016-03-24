(function() {
    'use strict';

    angular.module('demo-app', [
        'ngMaterial',
        'ngMessages',        
        'demo-app-tpl',
        'demo-app.controller',
        'demo-app.service.io',
    ])
    .config([
        '$mdThemingProvider',
        function($mdThemingProvider) {
            $mdThemingProvider.theme('default');
        }
    ])
    .run(function(ioService) {
        ioService.init('http://localhost:8080');
    });
})();
