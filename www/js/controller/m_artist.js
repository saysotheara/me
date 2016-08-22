// This is a JavaScript file

app.controller('ArtistController', ['$rootScope', '$scope', '$filter', 'service', 'localStorageService', function($rootScope, $scope, $filter, service, localStorageService) {
    
    $scope.onAlbumClick = function() {
        $scope.select = 'album';
        $scope.searchBy = 'album';
        $scope.showSearch = false;
        $scope.limitToNum = 95;
        $scope.searchQuery = '';
        $scope.filterAlbum = '';
        service.filterAlbum = '';
    };

    $scope.onArtistClick = function() {
        $scope.select = 'artist';
        $scope.searchBy = 'artist';
        $scope.showSearch = false;
        $scope.searchQuery = '';
        $scope.filterAlbum = '';
        service.filterAlbum = '';
    };
    
    $scope.$on('refresh: loadArtist', function() {
        $scope.grid = 'show';
        $scope.choice = 'artist';
        $scope.select = 'album';
        $scope.searchBy = 'album';
        $scope.pageTitle = '';
        $scope.isShowGrid = true;
        $scope.showSearch = false;
        $scope.limitToNum = 95;
        $scope.searchQuery = '';
        $scope.filterAlbum = service.filterAlbum;
        $scope.productions = service.productions;

        if (service.showArtist) {
            $scope.select = 'artist';
            $scope.searchBy = 'artist';
            if (service.artists) {
                $scope.artists = service.artists;
                return;
            }
        }
        else {
            if (service.albums) {
                $scope.albums = service.albums;
                return;
            }
        }

        $scope.albums = '';
        $scope.artists = '';
        $scope.isLoading = true;
        $rootScope.$broadcast('refresh: album_artist');
    });
    
    $scope.$on('refresh: album_artist', function(){
        service.cloudAPI.liveAlbumList( { filter : "all" } )
            .success( function(result) {
                $scope.albums = result;
                service.albums = result;
            })
            .finally( function() {
                $scope.isLoading = false;
            }
        );
        service.cloudAPI.liveArtistList( { filter : "all" } )
            .success( function(result) {
                $scope.artists = result;
                service.artists = result;
            }
        );
        if (!service.getPopover()) {
            ons.createPopover('popover.html', { parentScope: $scope }).then(function(popover) {
                $scope.popover = popover;
                service.setPopover($scope.popover);
            });
        }
    });

    $scope.onAlbumSelect = function(item) {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        service.selected_album = item;
        service.cloudAPI.liveAlbumViewAdd( { id: item.id, uuid: device.uuid } );
        service.detail = 'music_by_album';
        app.navi.pushPage('detail.html');
    };

    $scope.onArtistSelect = function(item) {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        service.selected_artist = item;
        service.cloudAPI.liveArtistViewAdd( { id: item.id, uuid: device.uuid } );
        service.detail = 'music_by_artist';
        app.navi.pushPage('detail.html');
    };
    
    $scope.onAlbumFilterClick = function(album) {
        $scope.showSearch = false;
        $scope.limitToNum = 95;
        $scope.searchQuery = '';
        $scope.filterAlbum = album;
        service.filterAlbum = album;
    };
    
    $scope.$on('refresh: filterAlbum', function(){
        $scope.onAlbumFilterClick(service.filterAlbum);
    });
    
    // New Album
    $scope.$on('refresh: loadNewAlbum', function(){
        $scope.grid     = 'hide';
        $scope.choice   = 'new_album';
        $scope.select   = 'new_album';
        $scope.pageTitle = service.selected_album.album;
        $scope.collection = service.selected_album.album;
        
        $scope.musics = '';
        $scope.isLoading = true;
        $scope.showNoItem = false;
        $scope.limitToMusic = 60;
        service.cloudAPI.liveMusicList( { album : service.selected_album.album } )
            .success( function(result){
                $scope.musics = result;
                service.musics = result;
            })
            .finally( function() {
                $scope.isLoading = false;
                $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
            }
        );
    });
    
    $scope.$on('refresh: loadFeaturedArtist', function() {
        $scope.grid     = 'hide';
        $scope.choice   = 'new_album';
        $scope.select   = 'new_album';
        $scope.pageTitle = service.selected_artist.name;
        $scope.collection = service.selected_artist.name;
        
        $scope.musics = '';
        $scope.isLoading = true;
        $scope.showNoItem = false;
        $scope.limitToMusic = 60;
        service.cloudAPI.liveArtistMusicList( { artist : service.selected_artist.name_en } )
            .success( function(result){
                $scope.musics = result;
                service.musics = result;
            })
            .finally( function() {
                $scope.isLoading = false;
                $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
            }
        );
    });
    
    $scope.onMusicSortBy = function(field) {
        $scope.field = field;
        $scope.subfield = 'title';
        $scope.reverse = false;
        $scope.limitToMusic = 60;
        if ($scope.field === 'liked' || $scope.field === 'view' || $scope.field === 'album') {
            $scope.reverse = true;
        }
        if ($scope.field === 'album') {
            $scope.musics = $filter('orderBy')($scope.musics, [$scope.field, $scope.subfield], $scope.reverse);
        }
        else {
            $scope.musics = $filter('orderBy')($scope.musics, $scope.field, $scope.reverse);
        }
    };
    
    $scope.onLoadMoreClick = function() {
        if ($scope.albums.length > $scope.limitToNum) {
            $scope.limitToNum = $scope.limitToNum + 36;
        }
        else {
            window.plugins.toast.showShortCenter('No more albums to load...');
        }
    };

    $scope.on404Click = function() {
        if ($scope.select === 'album') {
            $scope.onAlbumClick();
        }
        else if ($scope.select === 'artist') {
            $scope.onArtistClick();
        }
    };

}]);


