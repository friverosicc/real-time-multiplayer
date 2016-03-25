(function() {
    'use strict';

    angular.module('demo-app.controller.auction', [
        'ngMaterial',
        'demo-app.service.io',
        'demo-app.service.session',
        'demo-app.common.auction'
    ])
    .controller('auctionController', [
        '$scope',
        '$timeout',
        '$mdToast',
        '$auction',
        'ioService',
        'userSession',
        function($scope, $timeout, $mdToast, $auction, ioService, userSession) {
            var _countDownRunning = false;
            var _user = userSession.getUser();
            var _socket = ioService.getSocket();
            $scope.inputHidden = false;
            $scope.bid = { buyer: _user.username };
            $scope.user = _user;

            function _countDown() {
                $scope.timeLeft--;
                $scope.inputHidden = false;

                if($scope.timeLeft > 0) {
                    $timeout(_countDown, 1000);
                } else {
                    _countDownRunning = false;
                    $scope.inputHidden = true;
                    _socket.emit('close auction');
                }
            }

            function _showMessage(msg) {
                $mdToast.show(
                    $mdToast.simple()
                    .content(msg)
                    .position('top right')
                    .hideDelay(6000)
                    .capsule(true)
                );
            }

            $scope.placeBid = function() {
                $scope.bid.time = new Date();
                _socket.emit('place bid', $scope.bid);
            };

            _socket.on('place bid success', function() { _socket.emit('find auction'); });
            _socket.on('place bid error', function(error) { _showMessage(error); });
            _socket.on('close auction success', function() {
                _socket.emit('find inventory', _user.username);
                _socket.emit('find user', _user.username);
            });

            _socket.emit('find auction');
            _socket.on('find auction success', function(auction) {
                if(auction) {
                    $scope.timeLeft = parseInt(((new Date(auction.created_at).getTime() - new Date().getTime()) + 90000 ) / 1000);
                    $scope.timeLeft = ($scope.timeLeft < 0) ? 0 : $scope.timeLeft;

                    if(!_countDownRunning) {
                        _countDownRunning = true;
                        _countDown();
                    }
                }

                $scope.auction = auction;
                $scope.$apply();
            });
        }
    ]);
})();
