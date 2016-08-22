// This is a JavaScript file

app.controller('MenuController', ['$rootScope','$scope', '$location', 'service', '$controller', 'localStorageService', function($rootScope, $scope, $location, service, $controller, localStorageService) {

    angular.extend(this, $controller('SNSController', {$scope: $scope}));

    $scope.$on('refresh: feed', function() {
        $scope.grid = 'hide';
        $scope.choice = "feed";
        $scope.pageTitle = "Notification Updates";
        
        if ($scope.feeds) {
            return;
        }
        
        $scope.isLoading = true;
        service.cloudAPI.feedList()
            .success( function(result, status){
                $scope.feeds = result;
            })
            .finally( function() {
                $scope.isLoading = false;
            }
        );
    });
    
    $scope.$on('refresh: about', function() {
        $scope.grid = 'hide';
        $scope.choice = "about";
        $scope.pageTitle = "About Us";
        service.cloudAPI.aboutList()
            .success( function(result, status){
                $scope.apps  = result;
                $scope.about = result[1];
            }
        );    
    });

    $scope.txtName = '';
    $scope.txtMessage = '';
    $scope.onSendFeedbackClick = function() {
        if ($scope.txtMessage.length >= 5) {
            var feedback = {
                name    : $scope.txtName,
                message : $scope.txtMessage,
                uuid    : device.uuid
            };
            service.cloudAPI.liveFeedbackSend( feedback )
                .success( function(result){
                    $scope.txtName = '';
                    $scope.txtMessage = '';
                    window.plugins.toast.showShortCenter("Submitted. Thank You!");
                }
            );
        }
        else {
            window.plugins.toast.showShortCenter("Tell Us What You Think Using Message...");
        }
    };
    
    $scope.$on('refresh: contact', function() {
        $scope.grid = 'hide';
        $scope.choice = "contact";
        $scope.pageTitle = "What You Think";
    });

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
    
    $scope.formatTime = function (value) {
        value = (value == undefined) ? 0 : value;
        var sec_num = parseInt(value, 10);
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
    
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        var time    = minutes+':'+seconds;
        return time;
    }

    $scope.onUrlClick = function(url) {
        window.open(url, '_blank');
    };
    
    $scope.onSupereanSelect = function(item) {
        var reviewUrl;
        if (ons.platform.isIOS()) {
            reviewUrl = item.url_ios;
        }
        else if (ons.platform.isAndroid()) {
            reviewUrl = item.url_android;
        }
        else {
            reviewUrl = '';
        }
        window.open(reviewUrl, '_system');
    };
    
    $scope.onListClick  = function() {
        $scope.isShowGrid = false;
    };
    $scope.onGridClick  = function() {
        $scope.isShowGrid = true;
    };

    $scope.$on('event: onNetworkStatusChange', function(){
        $scope.isOnline = service.isOnline;
    });

    /*
        Live - Radio, Series
    */
    angular.extend(this, $controller('LiveController', {$scope: $scope}));

    /*
        Music Top & New - Promotion
    */
    angular.extend(this, $controller('PromoteController', {$scope: $scope}));
    
    /*
        Music Chart
    */
    angular.extend(this, $controller('ChartController', {$scope: $scope}));
    
    /*
        Music Download
    */
    angular.extend(this, $controller('DownloadController', {$scope: $scope}));
    
    /*
        Music My Playlist
    */
    angular.extend(this, $controller('MyPlaylistController', {$scope: $scope}));
    
    /*
        Music History
    */
    angular.extend(this, $controller('HistoryController', {$scope: $scope}));    
    
    /*
        Music Ablum & Artist
    */
    angular.extend(this, $controller('ArtistController', {$scope: $scope}));

    /*
        Music Video
    */
    angular.extend(this, $controller('MVController', {$scope: $scope}));

    /*
        Search
    */
    angular.extend(this, $controller('SearchController', {$scope: $scope}));

    /*
        Offline Mode
    */
    angular.extend(this, $controller('OfflineController', {$scope: $scope}));

    /*
        My Profile
    */
    angular.extend(this, $controller('ProfileController', {$scope: $scope}));

    /*
        News
    */
    angular.extend(this, $controller('MenuNewsController', {$scope: $scope}));

    /*
        Common Functionalities
    */
    angular.extend(this, $controller('MenuMusicController', {$scope: $scope}));

}]);

app.controller('MoreController', ['$rootScope','$scope', 'service', 'localStorageService', function($rootScope, $scope, service, localStorageService) {

    $scope.productions = service.productions;
    $scope.productionPath = service.productionPath;

    $scope.onAlbumFilterClick = function(album) {
        service.filterAlbum = album;
        $rootScope.$broadcast('refresh: filterAlbum');
        $scope.popover = service.getPopover();
        $scope.popover.hide();
    };
    
}]);

