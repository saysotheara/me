// This is a JavaScript file

app.controller('MoreViewController', ['$rootScope', '$scope', 'service', '$controller', 'localStorageService', function($rootScope, $scope, service, $controller, localStorageService) {

    angular.extend(this, $controller('Controller', {$scope: $scope}));
    angular.extend(this, $controller('SNSController', {$scope: $scope}));

    service.page = 'more';

    $scope.onNewsClick = function() {
        $scope.mainTab.loadPage('news.html');
    };

    $scope.onRadioClick = function() {
        $scope.mainTab.loadPage('radio.html');
    };

    $scope.onTVClick = function() {
        $scope.mainTab.loadPage('tv.html');
    };

    $scope.onShowClick = function() {
        $scope.mainTab.loadPage('show.html');
    };

    $scope.onSettingClick = function() {
        $scope.mainTab.loadPage('setting.html');
    };

    // Sponsors
    if (service.sponsors) {
        $scope.sponsors = service.sponsors;
    }
    else {
        service.cloudAPI.liveSponsorList()
            .success( function(result){
                $scope.sponsors = result;
                service.sponsors = result;
            }
        );
    }
    
}]);



