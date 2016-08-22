// This is a JavaScript file

app.controller('SearchController', ['$rootScope', '$scope', '$filter', 'service', 'localStorageService', function($rootScope, $scope, $filter, service, localStorageService) {

    $scope.$on('refresh: loadSearch', function() {
        $scope.grid         = 'hide';
        $scope.choice       = 'search';
        $scope.select       = 'search_music';
        $scope.searchOption = 'music';
        $scope.pageTitle    = '';
        $scope.musics       = '';
        service.musics      = '';
        $scope.searchText   = '';
        $scope.showNoItem   = false;
        $scope.limitToMusic = 50;

        if (navigator.connection.type === Connection.NONE) {
            $scope.isOnline = false;
            $scope.choice   = 'offline';
            $scope.select   = 'offline_search';
            $scope.pageTitle = 'Offline Search';
            service.musics  = service.getLocalStorageItems('offline_musics');
        }
    });

    $scope.onSearchOptionClick = function(searchOption) {
        $scope.musics       = '';
        $scope.searchText   = '';
        $scope.limitToMusic = 50;
        $scope.showNoItem   = false;
        $scope.searchOption = searchOption;
        $scope.select       = 'search_' + searchOption;
    };
    
    function doSearch(searchText) {
        $scope.isLoading = true;
        $scope.showNoItem = true;
        service.cloudAPI.liveSearch( { searchBy: $scope.searchOption, searchText: searchText } )
            .success( function(result) {
                $scope.musics = result;
                service.musics = result;
            })
            .finally(function() {
                $scope.isLoading = false;
                $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
            }
        );
    }

    $scope.$watch('searchText', function (value) {
        if (value && navigator.connection.type === Connection.NONE) {
            $scope.musics = $filter('filter')( service.musics, {'title': value} );
            $scope.showNoItem = ($scope.musics && $scope.musics.length === 0) ? true : false;
            return;
        }
        
        if (value && value.length > 1) {
            if (value.length == 3) {
                doSearch(value);
            }
            else {
                $scope.musics = $filter('filter')( service.musics, {'title': value} );
                $scope.showNoItem = ($scope.musics && $scope.musics.length === 0) ? true : false;
            }
        }
    });
    
    $scope.onSearchPlayClick = function() {
        if ($scope.select === 'search_mv') {
            $scope.onPlayMVClick();
        }
        if ($scope.select === 'search_music') {
            $scope.onMusicPlay();
        }
    };
    
    // search album, artist, all mv
    $scope.onQuickSearchClick = function() {
        $scope.searchText = '';
        $scope.showSearch = !$scope.showSearch;
        // $scope.show('quick_search.html');
    };

    $scope.$on('refresh: quick_search', function() {
        $scope.searchText = service.searchText;
    });

}]);


app.controller('DialogSearchController', ['$rootScope', '$scope', 'service', 'localStorageService', function($rootScope, $scope, service, localStorageService) {

    $scope.onDialogHide = function() {
        $scope.searchText = '';
    };

    $scope.onCancelClick = function() {
        $scope.dialog_search.hide();
    };

    $scope.$watch('searchText', function() {
        service.searchText = $scope.searchText;
        $rootScope.$broadcast('refresh: quick_search');
    });

}]);

