(function() {
    'use strict';

    angular.module('demo-app.service.io', [])
    .factory('ioService', [
        function() {
            var _socket;

            function init(urlServer) {
                _socket = io.connect(urlServer);
            }

            function getSocket() {
                return _socket;
            }

            return {
                init: init,
                getSocket: getSocket
            };
        }
    ]);
})();
