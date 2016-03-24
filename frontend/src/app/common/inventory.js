(function() {
    'use strict';

    angular.module('demo-app.common.inventory', [
        'material.core',
        'material.components.button'
    ])
    .directive('inventory', InventoryDirective)
    .provider('$inventory', InventoryProvider);

    function InventoryDirective($inventory) {
        return {
            restrict: 'E',
            link: function postLink(scope, element, attr) {
                scope.$on('$destroy', function() {
                    $inventory.destroy();
                });
            }
        };
    }

    function InventoryProvider($$interimElementProvider) {
        var $inventory = $$interimElementProvider('$inventory');

        return $inventory;
    }
})();
