(function() {
    'use strict';

    angular.module('demo-app.controller.inventory', [
        'ngMaterial',
        'demo-app.service.io',
        'demo-app.service.session',
        'demo-app.common.inventory'
    ])
    .controller('inventoryController', [
        '$scope',
        '$inventory',
        '$mdDialog',
        'ioService',
        'userSession',
        function($scope, $inventory, $mdDialog, ioService, userSession) {
            var _user = userSession.getUser();
            var _socket = ioService.getSocket();

            _socket.emit('find inventory', _user.username);
            _socket.on('find inventory success', function(inventory) {
                $scope.inventory = inventory;
                $scope.$apply();
            });

            $scope.openForm = function(item) {
                $mdDialog.show({
                    controller: 'createAuctionController',
                    templateUrl: 'controller/auction/create-auction.tpl.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    locals: {
                        item: item.name
                    }
                });
            };
        }
    ]);
})();
