(function() {
    'use strict';

    angular.module('demo-app.common.auction', [
        'material.core',
        'material.components.button'
    ])
    .directive('auction', AuctionDirective)
    .provider('$auction', AuctionProvider);

    function AuctionDirective($auction) {
        return {
            restrict: 'E',
            link: function postLink(scope, element, attr) {
                scope.$on('$destroy', function() {
                    $auction.destroy();
                });
            }
        };
    }

    function AuctionProvider($$interimElementProvider) {
        var $auction = $$interimElementProvider('$auction');

        return $auction;
    }
})();
