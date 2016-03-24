(function() {
    'use strict';

    angular.module('demo-app.service.session', [])
    .factory('userSession', [
        function() {
            var _userData = 'USER-DATA';

            function save(user) {
                window.sessionStorage.setItem(_userData, JSON.stringify(user));
            }

            function clean() {
                window.sessionStorage.clear();
            }

            function getUser() {
                return JSON.parse(window.sessionStorage.getItem(_userData));
            }

            return {
                save: save,
                clean: clean,
                getUser: getUser
            };
        }
    ]);
})();
