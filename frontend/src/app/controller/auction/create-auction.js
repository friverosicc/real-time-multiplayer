(function() {
    'use strict';

    angular.module('demo-app.controller.auction.create', [
        'ngMaterial',
        'demo-app.service.io',
        'demo-app.service.session'
    ])
    .controller('createAuctionController', [
        '$scope',
        '$mdDialog',
        '$mdToast',
        'ioService',
        'userSession',
        'item',
        function($scope, $mdDialog, $mdToast, ioService, userSession, item) {
            var _socket = ioService.getSocket();

            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            $scope.create = function() {
                var auction = {
                    seller: userSession.getUser().username,
                    item: item,
                    quantity: $scope.auction.quantity,
                    minimum_bid: $scope.auction.minimum_bid,
                    wining_bid: 0,
                    created_at: new Date(),
                    updated_at: new Date()
                };

                _socket.emit('create auction', auction);
            };

            _socket.on('create auction success', function() {
                $mdDialog.hide();
            });

            _socket.on('create auction error', function(error) {
                _showMessage(error);
            });

            function _showMessage(msg) {
                $mdToast.show(
                    $mdToast.simple()
                    .content(msg)
                    .position('top right')
                    .hideDelay(6000)
                    .capsule(true)
                );
            }
        }
    ]);
})();
