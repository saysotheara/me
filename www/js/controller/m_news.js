// This is a JavaScript file

app.controller('MenuNewsController', ['$rootScope', '$scope', 'service', 'localStorageService', function($rootScope, $scope, service, localStorageService) {

    $scope.newsPath = service.newsPath;
    
    $scope.$on('refresh: loadNewsDetail', function() {
        $scope.grid = 'hide';
        $scope.choice = 'news';
        $scope.pageTitle = "News";
        
        $scope.selected_news = service.selected_news;

        $scope.files = '';
        $scope.isLoading = true;
        $scope.photoExist = false;
        $scope.videoExist = false;
        service.cloudAPI.liveNewsDetailList( { news_id: $scope.selected_news.id } )
            .success( function(result) {
                $scope.files = result;
                if (result[0].photo_url) {
                    $scope.photoExist = true;
                }
                if (result[0].video_url) {
                    $scope.videoExist = true;
                }
            })
            .finally( function() {
                $scope.isLoading = false;
            }
        );

    });
    
}]);


