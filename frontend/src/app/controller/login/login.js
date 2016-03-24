(function() {
    'use strict';

    angular.module('demo-app.controller.login', [
        'ngMaterial',
        'demo-app.service.io',
        'demo-app.service.session'
    ])
    .controller('loginController', [
        '$scope',
        '$mdDialog',
        'ioService',
        'userSession',
        function($scope, $mdDialog, ioService, userSession) {
            var _socket = ioService.getSocket();

            $scope.login = function() {
                $scope.user.token = ''+ new Date().getTime();
                _socket.emit('login', $scope.user);
            };

            _socket.on('login success', function() {
                userSession.save($scope.user);
                $mdDialog.hide();
            });            
        }
    ]);
})();
