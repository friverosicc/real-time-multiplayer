(function() {
    'use strict';

    angular.module('demo-app.controller', [
        'ngMaterial',
        'demo-app.controller.login',
        'demo-app.controller.player-stats',
        'demo-app.controller.inventory',
        'demo-app.service.io',
        'demo-app.service.session',
        'demo-app.common.player-stats',
        'demo-app.common.inventory',
        'demo-app.common.auction'
    ])
    .controller('appController', [
        '$mdDialog',
        '$playerStats',
        '$inventory',
        '$auction',
        'userSession',
        'ioService',
        function($mdDialog, $playerStats, $inventory, $auction, userSession, ioService) {
            var _user = userSession.getUser();
            if(_user)
                _showWidgets();
            else
                _showLoginForm();

            var _socket = ioService.getSocket();
            _socket.on('logout user', _logout);

            function _showWidgets() {
                $auction.show({
                    controller: 'loginController',
                    template: '<h1>AUCTION</h1>',
                    parent: angular.element(document.body),
                });

                $inventory.show({
                    controller: 'inventoryController',
                    templateUrl: 'controller/inventory/inventory.tpl.html',
                    parent: angular.element(document.body),
                });

                $playerStats.show({
                    controller: 'playerStatsController',
                    templateUrl: 'controller/player-stats/player-stats.tpl.html',
                    parent: angular.element(document.body),
                })
                .then(_showLoginForm);
            }

            function _showLoginForm() {
                $inventory.cancel();
                $auction.cancel();
                $playerStats.cancel();

                $mdDialog.show({
                    controller: 'loginController',
                    templateUrl: 'controller/login/login.tpl.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false
                })
                .then(_showWidgets);
            }

            function _logout(user) {
                var userLogged = userSession.getUser();

                if(angular.isDefined(userLogged) && angular.isObject(userLogged)) {
                    if(user.username === userLogged.username && user.token != userLogged.token) {
                        userSession.clean();
                        _showLoginForm();
                    }
                }
            }
        }
    ]);
})();
