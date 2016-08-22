// This is a JavaScript file

app.controller('RadioController', ['$rootScope','$scope', 'service', '$controller', 'localStorageService', function($rootScope, $scope, service, $controller, localStorageService) {
        
    angular.extend(this, $controller('Controller', {$scope: $scope}));

    service.page = 'radio';
    
    $scope.items = (service.items) ? service.items : '';
    
    $scope.filterMe = function(item) {
        return (item.type === 'radio' || item.type === 'music');
    };
    
}]);


