(function() {
    'use strict';

    angular.module('demo-app.controller.player-stats', [
        'demo-app.service.io',
        'demo-app.service.session',
        'demo-app.common.player-stats'
    ])
    .controller('playerStatsController', [
        '$scope',
        '$playerStats',
        'ioService',
        'userSession',
        function($scope, $playerStats, ioService, userSession) {
            var _user = userSession.getUser();
            var _socket = ioService.getSocket();

            _socket.emit('find user', _user.username);
            _socket.on('find user success', function(user) {
                $scope.user = user;
                $scope.$apply();
            });

            $scope.logout = function() {
                userSession.clean();
                $playerStats.hide();
            };
        }
    ]);
})();
