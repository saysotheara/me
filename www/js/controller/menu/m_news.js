// This is a JavaScript file

app.controller('MenuNewsController', ['$rootScope', '$scope', 'service', 'localStorageService', function($rootScope, $scope, service, localStorageService) {

    $scope.newsPath = service.newsPath;
    
    $scope.shuffleArray = function(array) {
        var m = array.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    };
    
    $scope.$on('refresh: loadNewsDetail', function() {
        $scope.grid = 'hide';
        $scope.choice = 'news';
        $scope.pageTitle = "News";
        
        $scope.selected_news = service.selected_news;

        $scope.isLoading = true;
        $scope.photoExist = false;
        $scope.videoExist = false;
        $scope.files = [];
        $scope.videos = [];
        $scope.firstFile = '';
        service.cloudAPI.liveNewsDetailList( { news_id: $scope.selected_news.id } )
            .success( function(result) {
                for( i=0; i<=result.length-1; i++) {
                    if (result[i].type === 'photo') {
                        if (!$scope.photoExist) {
                            $scope.firstFile = result[i];
                        }
                        else {
                            $scope.files.push(result[i]);
                        }
                        $scope.photoExist = true;
                    }
                    if (result[i].type === 'video') {
                        $scope.videoExist = true;
                        $scope.videos.push(result[i]);
                    }
                }
            })
            .finally( function() {
                $scope.isLoading = false;
            }
        );

        $scope.number_related_news = 6;
        service.cloudAPI.liveRelatedNewsList( { news_id: $scope.selected_news.id } )
            .success( function(result) {
                result = $scope.shuffleArray(result);
                $scope.related_news = result;
            }
        );
    });

    $scope.onShareNewsClick = function() {
        window.plugins.socialsharing.available(function(isAvailable) {
            if (isAvailable) {
                window.plugins.socialsharing.shareViaFacebook( 
                    $scope.selected_news.title, 
                    $scope.newsPath + '/' + $scope.selected_news.media_url, 
                    $scope.selected_news.page_url, 
                    function(result) {
                        window.plugins.toast.showShortCenter('Facebook Share done.');
                    },
                    function(error){
                        window.plugins.toast.showShortCenter('Facebook Share failed.');
                    }
                );
            }
            else {
                window.plugins.toast.showShortCenter('Facebook Account not found.');
            }
        });
    };

    $scope.onRelatedNewsSelect = function(item) {
        service.selected_news = item;
        $scope.app.slidingMenu.toggleMenu();
        $rootScope.$broadcast('refresh: loadNewsDetail');
        $scope.app.slidingMenu.toggleMenu();
    };
    
}]);


