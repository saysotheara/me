// This is a JavaScript file

app.controller('MainController', ['$rootScope', '$scope', 'service', '$controller', 'localStorageService', function($rootScope, $scope, service, $controller, localStorageService) {

    $scope.version = service.version;
    $scope.platform = service.platform;

    $scope.isStarting = false;
    $scope.showPlayer = false;
    
    service.n_download = 0;
    
    $scope.$on('refresh: showPlayer', function() {
        if (service.showPlayer) {
            return 0;
        }
        $scope.showPlayer = true;
        service.showPlayer = true;
        
        if ($scope.player) {
            service.mediaPlayer = $scope.player;
        }

        if (ons.platform.isIOS()) {
            // enable background mode
            cordova.plugins.backgroundMode.enable();
        }
        
        var _player = document.getElementById("player");
        _player.addEventListener("ended", 
            function() {
                var currentTrack = $scope.player.currentTrack - 1;
                if (service.isRepeat) {
                    service.track = currentTrack;
                    service.playedMusic = $scope.music_playlists[service.track];
                    $rootScope.$broadcast('refresh: musicSelected');
                }
                else {
                    if (currentTrack < $scope.music_playlists.length - 1) {
                        service.playedMusic = $scope.music_playlists[currentTrack + 1];
                        $rootScope.$broadcast('refresh: nextPlaying');
                    }
                    else {
                        service.track = 0;
                        service.playedMusic = $scope.music_playlists[service.track];
                        $rootScope.$broadcast('refresh: musicSelected');
                    }
                }
            }, 
            true
        );
    });
    
    $scope.$on('refresh: stopPlayer', function() {
        $scope.player.pause();
    });

    $scope.$on('refresh: reloadPlaylist', function(){
        $scope.music_playlists = service.music_playlists;
        if (service.play_exception) {
            $scope.$apply();
        }
    });

    $scope.$on('refresh: musicSelected', function(){
        $scope.isStarting = true;
        service.isStarting = $scope.isStarting;
        $rootScope.$broadcast('refresh: streaming');
        if (service.play_exception) {
            service.play_exception = false;
            $scope.player.play(service.track);
            $rootScope.$broadcast('refresh: nowPlaying');
            setTimeout(function(){
                $scope.isStarting = false;
                service.isStarting = $scope.isStarting;
                $rootScope.$broadcast('refresh: streaming');
            }, 1000);
        }
        else {
            setTimeout(function(){
                $scope.player.play(service.track);
                $rootScope.$broadcast('refresh: nowPlaying');
                setTimeout(function(){
                    $scope.isStarting = false;
                    service.isStarting = $scope.isStarting;
                    $rootScope.$broadcast('refresh: streaming');
                }, 500);
            }, 500);
        }
    });

    $scope.onPlayPrevious = function() {
        var currentTrack = $scope.player.currentTrack - 1;
        if (navigator.connection.type === Connection.NONE && currentTrack > 0 && $scope.music_playlists[currentTrack - 1].src.indexOf('superean.com') > -1) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        if (currentTrack > 0) {
            $scope.isStarting = true;
            service.isStarting = $scope.isStarting;
            $rootScope.$broadcast('refresh: streaming');
            $scope.player.prev(true);
            service.playedMusic = $scope.music_playlists[currentTrack - 1];
            $rootScope.$broadcast('refresh: nowPlaying');
            setTimeout(function(){
                $scope.isStarting = false;
                service.isStarting = $scope.isStarting;
                $rootScope.$broadcast('refresh: streaming');
            }, 1000);
        }
    };
    $scope.$on('event: onPlayPrevious', function() {
        $scope.onPlayPrevious();
    });

    $scope.onPlayNext = function() {
        var currentTrack = $scope.player.currentTrack - 1;
        if (navigator.connection.type === Connection.NONE && currentTrack < $scope.music_playlists.length - 1 && $scope.music_playlists[currentTrack + 1].src.indexOf('superean.com') > -1) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        if (currentTrack < $scope.music_playlists.length - 1) {
            $scope.isStarting = true;
            service.isStarting = $scope.isStarting;
            $rootScope.$broadcast('refresh: streaming');
            $scope.player.next(true);
            service.playedMusic = $scope.music_playlists[currentTrack + 1];
            $rootScope.$broadcast('refresh: nowPlaying');
            setTimeout(function(){
                $scope.isStarting = false;
                service.isStarting = $scope.isStarting;
                $rootScope.$broadcast('refresh: streaming');
            }, 1000);
        }
        else {
            service.track = 0;
            service.playedMusic = $scope.music_playlists[service.track];
            $rootScope.$broadcast('refresh: musicSelected');
        }
    };
    $scope.$on('event: onPlayNext', function() {
        $scope.onPlayNext();
    });

    $scope.onFavoriteClick = function() {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        var currentTrack = $scope.player.currentTrack - 1;
        var song = $scope.music_playlists[ currentTrack ];
        var data = { 
            music_id  : song.id,
            title     : song.title,
            uuid      : device.uuid
        };
        service.showSpinner();
        service.cloudAPI.liveMusicSaveAdd( data )
            .finally( function() {
                service.shouldReload_favorite = true;
                window.plugins.toast.showShortCenter('Added to My Music successfully.');
                service.hideSpinner();
            }
        );
    };
    
    $scope.onHeartClick = function() {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        var callback = function(index) {
            if (index == 1) {
                $scope.onFavoriteClick();
            }
            else if (index == 2) {
                service.selected_music = service.playedMusic;
                $rootScope.$broadcast('event: onPlaylistMusicAdd');
            }
            else if (index == 3 && service.playedMusic.src.indexOf('superean.com') > -1 && service.showTV) {
                service.downloadedMusic = service.playedMusic;
                $rootScope.$broadcast('event: onDownloadMusicAdd');
            }
        };
        var buttonFavorite = 'Add to My Music';
        var buttonPlaylist = 'Add to My Playlist..';
        var buttonDownload = 'Download this Music';
        var options = {
            'title' : service.playedMusic.title,
            'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
            'buttonLabels': [buttonFavorite, buttonPlaylist, buttonDownload],
            'androidEnableCancelButton' : true,
            'addCancelButtonWithLabel': 'Cancel',
            'position': [20, 40]
        };
        if (service.playedMusic.src.indexOf('superean.com') === -1) {
            options = {
                'title' : service.playedMusic.title,
                'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
                'buttonLabels': [buttonFavorite, buttonPlaylist],
                'androidEnableCancelButton' : true,
                'addCancelButtonWithLabel': 'Cancel',
                'position': [20, 40]
            };
        }
        if (!service.showTV) {
            options = {
                'title' : service.playedMusic.title,
                'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
                'buttonLabels': [buttonFavorite, buttonPlaylist],
                'androidEnableCancelButton' : true,
                'addCancelButtonWithLabel': 'Cancel',
                'position': [20, 40]
            };
        }
        window.plugins.actionsheet.show(options, callback);
    };

    $scope.onPlaylistClick = function() {
        $rootScope.$broadcast('refresh: loadPlaylist');
        $scope.app.slidingMenu.toggleMenu();
    };
    
    $scope.onDiscoverTabClick = function() {
        $rootScope.$broadcast('refresh: onDiscoverTabClick');
    };
    
    $scope.onMoreTabClick = function() {
        if (service.page === 'news' || service.page === 'tv' || service.page === 'radio' || service.page === 'show' || service.page === 'setting') {
            $scope.mainTab.loadPage('more.html');
        }
    };
    
    document.addEventListener("resume", onResume, false);
    document.addEventListener("offline", onOffline, false);
    document.addEventListener("online", onOnline, false);

    function onResume() {
        if (service.device) {
            var today = new Date();
            if (service.lastVisit && service.lastVisit !== today.getDate()) {
                var userDevice = {
                    model    : device.model, 
                    platform : device.platform, 
                    uuid     : device.uuid, 
                    version  : device.version
                };
                service.device = userDevice;
                service.cloudAPI.liveDeviceAdd( userDevice );
                
                $rootScope.$broadcast('refresh: new_albums');
                service.musics_favorite = '';
                service.musics_for_you = '';
                service.musics_feature = '';
                service.musics_top = '';
                service.musics_new = '';
                service.musics_newMV = '';
                service.artists = '';
                service.albums = '';
                service.musics_newMV = '';
                service.musics_topMV = '';
                service.musics_recentMV = '';
            }
            service.lastVisit = today.getDate();
        }
    }

    $scope.isOnline = true;
    function onOffline() {
        $scope.isOnline = false;
        service.isOnline = $scope.isOnline;
        $rootScope.$broadcast("event: onNetworkStatusChange");
        $scope.$apply();
    }

    function onOnline() {
        $scope.isOnline = true;
        service.isOnline = $scope.isOnline;
        $rootScope.$broadcast("event: onNetworkStatusChange");

        var offline_played = service.getLocalStorageItems('offline_played');
        if (offline_played.length > 0) {
            var i = 0;
            function musicViewAdd () {
                setTimeout(function () {
                    service.cloudAPI.liveMusicViewAdd( { id: offline_played[i].id, uuid: device.uuid, title: offline_played[i].title } );
                    i++;
                    if (i < offline_played.length) {
                        musicViewAdd();
                    }
               }, 100);
            }
            musicViewAdd();
            localStorageService.remove('offline_played');
        }
        $scope.$apply();
    }

}]);

