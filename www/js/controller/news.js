// This is a JavaScript file

app.controller('NewsController', ['$rootScope','$scope', 'service', '$controller', 'localStorageService', function($rootScope, $scope, service, $controller, localStorageService) {
        
    angular.extend(this, $controller('Controller', {$scope: $scope}));

    service.page = 'news';

    $scope.number_news = 30;
    // if (service.news) {
    //     $scope.news = service.news;
    //     service.cloudAPI.liveNewsList()
    //         .success( function(result) {
    //             if (result[0].id !== service.news[0].id) {
    //                 $scope.news = result;
    //                 service.news = result;
    //             }
    //         }
    //     );
    // }
    // else {
        $scope.isLoading = true;
        service.cloudAPI.liveNewsList()
            .success( function(result) {
                $scope.news = result;
                service.news = result;
            })
            .finally( function() {
                $scope.isLoading = false;
                $scope.showNoItem = ($scope.news.length === 0) ? true : false;
            }
        );
    // }

    $scope.onNewsSelect = function(item) {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
        }
        else {
            service.selected_news = item;
            $scope.app.slidingMenu.toggleMenu();
            $rootScope.$broadcast('refresh: loadNewsDetail');
            service.cloudAPI.liveNewsViewAdd( { id: item.id, uuid: device.uuid } );
        }
    };

}]);


