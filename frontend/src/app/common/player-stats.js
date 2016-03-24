(function() {
    'use strict';

    angular.module('demo-app.common.player-stats', [
        'material.core',
        'material.components.button'
    ])
    .directive('playerStats', PlayerStatsDirective)
    .provider('$playerStats', PlayerStatsProvider);

    function PlayerStatsDirective($playerStats) {
        return {
            restrict: 'E',
            link: function postLink(scope, element, attr) {
                scope.$on('$destroy', function() {
                    $playerStats.destroy();
                });
            }
        };
    }

    function PlayerStatsProvider($$interimElementProvider) {
        var $playerStats = $$interimElementProvider('$playerStats');

        return $playerStats;
    }
})();
