// This is a JavaScript file

app.controller('StoreController', ['$rootScope','$scope', 'service', '$controller', function($rootScope, $scope, service, $controller) {

    angular.extend(this, $controller('Controller', {$scope: $scope}));

    service.page = 'store';

    
}]);


