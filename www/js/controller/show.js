// This is a JavaScript file

app.controller('ShowController', ['$rootScope','$scope', 'service', '$controller', 'localStorageService', function($rootScope, $scope, service, $controller, localStorageService) {
        
    angular.extend(this, $controller('Controller', {$scope: $scope}));

    service.page = 'show';
    
    $scope.onMovieClick = function() {
        $scope.choice = 1;
        $scope.isLoading_movie = false;
        $scope.showNoItem_movie = true;
    };

    $scope.onShowClick = function() {
        $scope.choice = 2;
        $scope.isLoading_show = false;
        $scope.showNoItem_show = true;

    };
    
    $scope.onDramaClick = function() {
        $scope.choice = 3;
        $scope.isLoading_drama = false;
        $scope.showNoItem_drama = true;

    };

    $scope.onShowClick();

}]);


