// This is a JavaScript file

app.controller('TVController', ['$rootScope','$scope', 'service', '$controller', function($rootScope, $scope, service, $controller) {
        
    angular.extend(this, $controller('Controller', {$scope: $scope}));

    service.page = 'tv';

    $scope.items = (service.items) ? service.items : '';
    
}]);


