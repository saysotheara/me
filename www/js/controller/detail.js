// This is a JavaScript file

app.controller('DetailController', ['$rootScope','$scope', '$filter', 'service', '$controller', 'localStorageService', function($rootScope, $scope, $filter, service, $controller, localStorageService) {
    
    angular.extend(this, $controller('SNSController', {$scope: $scope}));
    
    $scope.$on('event: onNetworkStatusChange', function(){
        $scope.isOnline = service.isOnline;
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
    
    // My Profile
    function profileLoader() {
        $scope.back_button = 'Profile';
        $scope.detail       = 'profile';
        $scope.pageTitle    = service.selected_profile_item;
        $scope.collection   = service.selected_profile_item;
        $scope.limitToMusic = 60;
        $scope.showNoItem = false;
        $scope.isLoading = true;
        $scope.isOnline = true;
        $scope.musics = '';
    };
    if (service.detail === 'music_by_history') {
        profileLoader();
        $scope.choice = 'history';
        $scope.select = $scope.choice;
        if (navigator.connection.type === Connection.NONE) {
            $scope.choice = 'offline';
            $scope.select = 'offline_history';
            $scope.pageTitle  = 'Offline History';
            $scope.collection = $scope.pageTitle;
            $scope.isLoading = false;
            $scope.isOnline = false;
            $scope.musics = service.getLocalStorageItems('offline_played');
            if ($scope.musics.length > 0) {
                $scope.musics = $scope.musics.reverse();
            }
            $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
            $scope.$apply();
        }
        else {
            service.cloudAPI.liveMusicHistoryList( { uuid : device.uuid } )
                .success( function(result) {
                    $scope.musics = result;
                })
                .finally( function() {
                    $scope.isLoading = false;
                    $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
                }
            );
        }
    }
    if (service.detail === 'music_for_you') {
        profileLoader();
        $scope.choice = 'for_you';
        $scope.select = $scope.choice;
        if (service.musics_for_you) {
            $scope.musics = service.musics_for_you;
            $scope.isLoading = false;
            $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
        }
        else {
            service.cloudAPI.liveMusicForYouList( { uuid : device.uuid } )
                .success( function(result) {
                    result = $scope.shuffleArray(result).splice(0, 50);
                    $scope.musics = result;
                    service.musics_for_you = result;
                })
                .finally( function() {
                    $scope.isLoading = false;
                    $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
                }
            );
        }
    }
    if (service.detail === 'music_by_favorite') {
        profileLoader();
        $scope.choice = 'favorite';
        $scope.select = $scope.choice;
        if (!service.shouldReload_favorite && service.musics_favorite) {
            $scope.musics = service.musics_favorite;
            $scope.isLoading = false;
            $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
        }
        else {
            service.cloudAPI.liveMusicSaveList( { uuid : device.uuid } )
                .success( function(result) {
                    $scope.musics = result;
                    service.musics_favorite = result;
                    service.shouldReload_favorite = false;
                })
                .finally( function() {
                    $scope.isLoading = false;
                    $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
                }
            );
        }
    }
    if (service.detail === 'music_by_download') {
        profileLoader();
        $scope.detail = 'download';
        $scope.choice = 'download';
        $scope.select = 'd_music';
        $scope.musicQuery = '';
        
        $scope.isLoading = false;
        $scope.musics = service.getLocalStorageItems('offline_musics');
        $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
        $scope.isOnline = (navigator.connection.type === Connection.NONE) ? false : true;
    }    
    
    $scope.$on('refresh: download_finished', function(){
        if ($scope.detail === 'download') {
            $scope.musics = service.getLocalStorageItems('offline_musics');
            $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
        }
    });
    
    $scope.onSearchDownload = function(value) {
        if ($scope.detail === 'download') {
            $scope.musics = $filter('filter')( service.getLocalStorageItems('offline_musics'), value );
        }
    };
    
    // Music by MV
    if (service.detail === 'music_by_mv') {
        $scope.back_button = 'Album';
        $scope.detail       = 'mv';
        $scope.pageTitle    = service.selected_mv.album;
        $scope.collection   = service.selected_mv.album;
        $scope.limitToMusic = 60;

        $scope.musics = '';
        $scope.showNoItem = false;
        $scope.isLoading = true;
        service.cloudAPI.liveMVDetailList( { album : service.selected_mv.album, uuid : device.uuid } )
            .success( function(result){
                $scope.musics = result;
            })
            .finally( function() {
                $scope.isLoading = false;
                $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
            }
        );
    }

    // Music by Album
    if (service.detail === 'music_by_album') {
        $scope.back_button = 'Album';
        $scope.detail       = 'album';
        $scope.pageTitle    = service.selected_album.album;
        $scope.collection   = service.selected_album.album;

        $scope.musics = '';
        $scope.showNoItem = false;
        $scope.isLoading  = true;
        $scope.limitToMusic = 60;
        service.cloudAPI.liveMusicList( { album : service.selected_album.album } )
            .success( function(result){
                $scope.musics = result;
            })
            .finally( function() {
                $scope.isLoading = false;
                $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
            }
        );
        $scope.isOnline = (navigator.connection.type === Connection.NONE) ? false : true;
    }

    // Music by Artist
    if (service.detail === 'music_by_artist') {
        $scope.back_button = 'Artist';
        $scope.detail       = 'artist';
        $scope.pageTitle    = service.selected_artist.name;
        $scope.collection   = service.selected_artist.name;

        $scope.musics = '';
        $scope.showNoItem = false;
        $scope.isLoading  = true;
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
        $scope.isOnline = (navigator.connection.type === Connection.NONE) ? false : true;
    }
    
    // Music by Playlist
    if (service.detail === 'music_by_playlist') {
        $scope.back_button = 'Playlist';
        $scope.detail       = 'playlist';
        $scope.pageTitle    = service.selected_playlist.name;
        $scope.collection   = service.selected_playlist.name;

        $scope.musics = '';
        $scope.isLoading = true;
        $scope.showNoItem = false;
        $scope.limitToMusic = 60;
        service.cloudAPI.liveMusicPlaylistDetailList( { playlist_id : service.selected_playlist.id } )
            .success( function(result){
                $scope.musics = result;
            })
            .finally( function() {
                $scope.isLoading = false;
                $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
            }
        );
        $scope.isOnline = (navigator.connection.type === Connection.NONE) ? false : true;
    }
    
    $scope.$on('event: onPlaylistMusicDelete', function() {
        var item = service.selected_music;
        var itemIndex = $scope.musics.indexOf(item);
        service.cloudAPI.liveMusicPlaylistDetailDelete( { music_id: item.id, playlist_id: item.playlist_id, uuid: device.uuid } )
            .success( function(result) {
                $scope.musics.splice(itemIndex, 1);
                window.plugins.toast.showShortCenter('Deleted Music from the Playlist.');
                $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
            })
            .error( function() {
                window.plugins.toast.showShortCenter('Cannot delete this Music from the Playlist.');
            }
        );
    });

    // Music by Playlist Offline
    if (service.detail === 'music_by_playlist_offline') {
        $scope.back_button = 'Playlist';
        $scope.detail       = 'playlist_offline';
        $scope.pageTitle    = service.selected_playlist.name;
        $scope.collection   = service.selected_playlist.name;
        $scope.limitToMusic = 60;
        
        $scope.musics = service.getLocalStorageItems('offline_playlists_' + service.selected_playlist.id);
        $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
        $scope.isOnline = (navigator.connection.type === Connection.NONE) ? false : true;
    }
        
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

    $scope.onMVPlaySelect = function(item) {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
        }
        else {
            if (navigator.connection.type !== Connection.WIFI) {
                window.plugins.toast.showShortCenter('Please connect to Wifi to save cellular data...');
            }
            $rootScope.$broadcast('refresh: stopPlayer');
            service.cloudAPI.liveMVDetailViewAdd( { id: item.id, title: item.title, uuid: device.uuid } );
            if (item.other === '') {
                var videoUrl = encodeURI($scope.mvPath + "/" + item.album + "/" + item.url);
                window.plugins.streamingMedia.playVideo(videoUrl, null);
            }
            else {
                YoutubeVideoPlayer.openVideo( item.type );
            }
        }
    };

    $scope.onPlayMVClick = function() {
        if ($scope.musics.length === 0) {
            window.plugins.toast.showShortCenter('No Music Video (MV) to play...');
            return;
        }
        var index = Math.floor(Math.random() * $scope.musics.length);
        $scope.onMVPlaySelect($scope.musics[index]);
    };
    
    // Music Connect via Facebook
    if (service.detail === 'connect') {
        $scope.back_button  = 'Profile';
        $scope.detail       = 'connect';
        $scope.pageTitle    = 'Activity & Connect';
        
        $scope.isLoading = true;
        service.cloudAPI.liveMusicConnectList()
            .success( function(result){
                $scope.musics = result;
            })
            .finally( function() {
                $scope.isLoading = false;
                $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
            }
        );        
    }    
    
    angular.extend(this, $controller('DownloadController', {$scope: $scope}));
    angular.extend(this, $controller('MenuMusicController', {$scope: $scope}));

}]);

