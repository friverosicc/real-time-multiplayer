(function() {
    'use strict';

    angular.module('demo-app.controller.auction', [
        'demo-app.service.io',
        'demo-app.service.session',
        'demo-app.common.auction'
    ])
    .controller('auctionController', [
        '$scope',
        '$timeout',
        '$auction',
        'ioService',
        'userSession',
        function($scope, $timeout, $auction, ioService, userSession) {
            var _user = userSession.getUser();
            var _socket = ioService.getSocket();

            _socket.emit('find auction');
            _socket.on('find auction success', function(auction) {
                if(auction)
                    $scope.timeLeft = parseInt(((new Date(auction.created_at).getTime() - new Date().getTime()) + 90000 ) / 1000);
                $scope.auction = auction;
                $scope.$apply();
                _countDown();
            });

            function _countDown() {
                $scope.timeLeft--;

                if($scope.timeLeft > 0) {
                    $timeout(_countDown, 1000);
                } else {
                    $scope.inputHidden = true;
                }
            }
        }
    ]);
})();
