(function() {
    'use strict';

    angular.module('demo-app.controller.inventory', [
        'demo-app.service.io',
        'demo-app.service.session',
        'demo-app.common.inventory'
    ])
    .controller('inventoryController', [
        '$scope',
        '$inventory',
        'ioService',
        'userSession',
        function($scope, $playerStats, ioService, userSession) {
            var _user = userSession.getUser();
            var _socket = ioService.getSocket();

            _socket.emit('find inventory', _user.username);
            _socket.on('find inventory success', function(inventory) {
                console.log(inventory);
                $scope.inventory = inventory;
                $scope.$apply();
            });
        }
    ]);
})();
