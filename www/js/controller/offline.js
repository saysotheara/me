// This is a JavaScript file

app.controller('OfflineController_music', ['$rootScope','$scope', 'service', '$controller', 'localStorageService', function($rootScope, $scope, service, $controller, localStorageService) {

    angular.extend(this, $controller('Controller', {$scope: $scope}));

    service.page = 'offline_music';

    $scope.limitToMusic = 60;

    $scope.musics = service.getLocalStorageItems('offline_musics');
    $scope.showNoItem = ($scope.musics.length === 0) ? true : false;

    $scope.onMusicSelect = function(item, itemIndex) {
        var playlist = [];
        var items = $scope.musics;
        for( i=0; i<=items.length-1; i++) {
            items[i].src = encodeURI(cordova.file.dataDirectory + 'MUSIC/' + items[i].url);
            playlist.push( items[i] );
        }
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory + 'MUSIC/' + item.url, 
            function (fileSystem) {
                if (fileSystem.isFile) {
                    service.track = itemIndex;
                    service.music_playlists = playlist;
                    service.playedMusic = items[service.track];
                    if (!service.showPlayer && !service.play_exception) {
                        service.play_exception = true;
                    }
                    $rootScope.$broadcast('refresh: showPlayer');
                    $rootScope.$broadcast('refresh: reloadPlaylist');
                    $rootScope.$broadcast('refresh: musicSelected');
                }
            }, 
            function (error) {
                window.plugins.toast.showShortCenter("Not found..., please download again.");
            }
        );
    };

    $scope.onMusicPlay = function() {
        if ($scope.musics.length === 0) {
            window.plugins.toast.showShortCenter('Music Not Found => No Music to play...');
            return;
        }
        var index = Math.floor(Math.random() * $scope.musics.length);
        $scope.onMusicSelect($scope.musics[index], index);
    };
    
    $scope.onButtonClick = function(item, itemIndex) {
        var callback = function(index) {
            if (index == 1) {
                if (service.showPlayer) {
                    // add to Music Player
                    var playlist = service.music_playlists;
                    for( var i = 0; i < playlist.length; i++) {
                        if (playlist[i].id === item.id) {
                            window.plugins.toast.showShortCenter('Already added to Music Player...');
                            return;
                        }
                    }
                    item.src = encodeURI(cordova.file.dataDirectory + 'MUSIC/' + item.url);
                    playlist.push( item );
                    service.music_playlists = playlist;
                    $rootScope.$broadcast('refresh: reloadPlaylist');
                    window.plugins.toast.showShortCenter('Added to Music Player...');
                }
                else {
                    // play music
                    $scope.onMusicSelect(item, itemIndex);
                }
            }
            // Add to Offline Playlist..
            else if (index == 2) {
                service.selected_music = item;
                service.offline_playlists = service.getLocalStorageItems('offline_playlists');
                service.isOfflinePlaylist = true;
                if (service.offline_playlists.length === 0) {
                    service.isAddToMyPlaylist = true;
                    $scope.show('new_playlist.html');
                    $rootScope.$broadcast('refresh: isOfflinePlaylist');
                }
                else {
                    $scope.show('dialog_offline_playlist.html');
                }
            }
            // Delete this Music
            else if (index == 3) {
                $scope.musics.splice(itemIndex, 1);
                localStorageService.set('offline_musics', $scope.musics);
                $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
                $scope.$apply();
                
                service.deleted_music = item;
                $rootScope.$broadcast('event: onOfflinePlaylistMusicDelete');

                window.resolveLocalFileSystemURL(cordova.file.dataDirectory + 'MUSIC/', 
                    function (fileSystem) {
                        fileSystem.getFile(item.url, {create: false}, 
                            function (fileEntry) {
                                fileEntry.remove(
                                    function () {
                                        window.plugins.toast.showShortCenter('Deleted from Download successfully.');
                                    }, 
                                    function (error) {}
                                );
                            }, 
                            function (error) {}
                        );
                    }, 
                    function (error) {} 
                );
            }
        };
        var buttonMusic = 'Play this Music';
        var buttonPlaylist = 'Add to Offline Playlist..';
        var buttonDownload = 'Delete from My Device';
        if (service.showPlayer) {
            buttonMusic = 'Add to Up Next';
        }
        var options = {
            'title' : item.title,
            'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
            'buttonLabels': [buttonMusic, buttonPlaylist, buttonDownload],
            'androidEnableCancelButton' : true,
            'addCancelButtonWithLabel': 'Cancel',
            'position': [20, 40]
        };
        window.plugins.actionsheet.show(options, callback);
    };
    
    $scope.onLoadMusicClick = function() {
        if ($scope.musics.length > $scope.limitToMusic) {
            $scope.limitToMusic = $scope.limitToMusic + 30;
        }
        else {
            window.plugins.toast.showShortCenter('No more music to load...');
        }
    };
    
    $scope.dialogs = {};
    $scope.show = function(dlg) {
        if (!$scope.dialogs[dlg]) {
            ons.createDialog(dlg).then(function(dialog) {
                $scope.dialogs[dlg] = dialog;
                dialog.show();
            });
        }
        else {
            $scope.dialogs[dlg].show();
        }
    };

}]);

app.controller('OfflineController_playlist', ['$rootScope','$scope', 'service', '$controller', 'localStorageService', function($rootScope, $scope, service, $controller, localStorageService) {

    angular.extend(this, $controller('Controller', {$scope: $scope}));

    service.page = 'offline_playlist';

    $scope.playlists = service.getLocalStorageItems('offline_playlists');
    $scope.showNoItem = ($scope.playlists.length === 0) ? true : false;

    $scope.$on('refresh: offline_playlists', function() {
        $scope.playlists = service.getLocalStorageItems('offline_playlists');
        $scope.showNoItem = ($scope.playlists.length === 0) ? true : false;
    });

    $scope.onOfflinePlaylistAdd = function() {
        service.isAddToMyPlaylist = false;
        service.isOfflinePlaylist = true;
        service.offline_playlists = service.getLocalStorageItems('offline_playlists');
        $scope.show('new_playlist.html');
        $rootScope.$broadcast('refresh: isOfflinePlaylist');
    };

    $scope.onOfflinePlaylistSelect = function(item, itemIndex) {
        service.selected_playlist = item;
        $scope.app.slidingMenu.toggleMenu();
        $rootScope.$broadcast('refresh: loadOfflineMusicPlaylist');
    };

    $scope.onOfflinePlaylistButtonClick = function(item, itemIndex) {
        var callback = function(index) {
            if (index == 1) {
                $scope.onOfflinePlaylistSelect(item, itemIndex);
            }
            else if (index == 2) {
                service.isOfflinePlaylist = true;
                service.selected_playlist = item;
                service.selected_playlist_index = itemIndex;
                service.offline_playlists = service.getLocalStorageItems('offline_playlists');
                $scope.show('update_playlist.html');
                $rootScope.$broadcast('refresh: isOfflinePlaylist');
            }
            else if (index == 3) {
                $scope.playlists.splice(itemIndex, 1);
                localStorageService.set('offline_playlists', $scope.playlists);
                $rootScope.$broadcast('refresh: offline_playlists');
                $scope.showNoItem = ($scope.playlists.length === 0) ? true : false;
                $scope.$apply();
                
                // delete all musics in the playlist also.
                localStorageService.remove('offline_playlists_' + item.id);
            }
        };
        var options = {
            'title' : item.name,
            'androidTheme' : window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
            'buttonLabels': ['Open', 'Rename..', 'Delete'],
            'androidEnableCancelButton' : true,
            'addCancelButtonWithLabel': 'Cancel',
            'position': [20, 40]
        };
        window.plugins.actionsheet.show(options, callback);
    };

    $scope.dialogs = {};
    $scope.show = function(dlg) {
        if (!$scope.dialogs[dlg]) {
            ons.createDialog(dlg).then(function(dialog) {
                $scope.dialogs[dlg] = dialog;
                dialog.show();
            });
        }
        else {
            $scope.dialogs[dlg].show();
        }
    };

}]);

app.controller('OfflineController_playback', ['$rootScope','$scope', 'service', '$controller', 'localStorageService', function($rootScope, $scope, service, $controller, localStorageService) {

    angular.extend(this, $controller('Controller', {$scope: $scope}));

    service.page = 'offline_playback';

    $scope.isRepeat  = false;
    $scope.isShuffle = false;

    $scope.isChecking   = false;
    $scope.limitToMusic = 30;
    service.selectArtist = false;
    $scope.music_playlists = service.music_playlists;
    $scope.showPlayer = (service.showPlayer) ? service.showPlayer : false;
    $scope.switchIcon = 'list-alt';

    $scope.onShuffleClick = function() {
        $scope.isShuffle = !$scope.isShuffle;
        service.isShuffle = $scope.isShuffle;
        
        if ($scope.isShuffle) {
            $scope.music_playlists = $scope.shuffleArray($scope.music_playlists);
        }
        else {
            $scope.music_playlists = service.music_playlists;
        }
        $scope.musicNow_index = $scope.music_playlists.indexOf(service.playedMusic);
        
        if ($scope.isShuffle) {
            window.plugins.toast.showShortCenter('Shuffle Music : ON');
        }
        else {
            window.plugins.toast.showShortCenter('Shuffle Music : OFF');
        }
    };

    $scope.onRepeatClick = function() {
        $scope.isRepeat = !$scope.isRepeat;
        service.isRepeat = $scope.isRepeat;
        
        if ($scope.isRepeat) {
            window.plugins.toast.showShortCenter('Repeat Music : ON');
        }
        else {
            window.plugins.toast.showShortCenter('Repeat Music : OFF');
        }
    };
    
    $scope.onSwitchPlayerClick = function() {
        $scope.switchIcon = ($scope.switchIcon === 'music') ? 'list-alt' : 'music';
    };

    $scope.onAddToPlaylistClick = function() {
        service.selected_music = $scope.musicNow;
        $rootScope.$broadcast('event: onOfflinePlaylistMusicAdd');
    };

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
        $scope.isChecking = true;
        service.cloudAPI.liveMusicSaveAdd( data )
            .finally( function() {
                $scope.isChecking = false;
                service.shouldReload_favorite = true;
                window.plugins.toast.showShortCenter('Added to My Music successfully.');
            }
        );
    };
    
    $scope.onPlayPrevious = function() {
        $rootScope.$broadcast('event: onPlayPrevious');
    };

    $scope.onPlayNext = function() {
        $rootScope.$broadcast('event: onPlayNext');
    };
    
    $scope.onPlaylistSelect = function(item, itemIndex) {
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory + 'MUSIC/' + item.url, 
            function (fileSystem) {
                if (fileSystem.isFile) {
                    service.track = itemIndex;
                    service.playedMusic = item;
                    $scope.musicNow = service.playedMusic;
                    $rootScope.$broadcast('refresh: musicSelected');
                    $scope.isStarting = true;
                    setTimeout(function(){
                        $scope.isStarting = false;
                    }, 1000);
                }
            }, 
            function (error) {
                window.plugins.toast.showShortCenter("Not found..., please download again.");
            }
        );
    };
    
    $scope.onButtonClick_playlist = function(item, itemIndex) {
        var callback = function(index) {
            if (index == 1) {
                if (item.id === $scope.musicNow.id) {
                    window.plugins.toast.showShortCenter('Playing: ' + item.title + ' => cannot remove...');
                }
                else {
                    $scope.music_playlists.splice(itemIndex, 1);
                    window.plugins.toast.showShortCenter('Removed from the Playlist successfully.');
                }
            }
            else if (index == 2) {
                service.selected_music = item;
                $rootScope.$broadcast('event: onOfflinePlaylistMusicAdd');
            }
        };
        var options = {
            'title' : item.title,
            'androidTheme' : window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
            'buttonLabels': ['Remove this Music', 'Add to Offline Playlist..'],
            'androidEnableCancelButton' : true,
            'addCancelButtonWithLabel': 'Cancel',
            'position': [20, 40]
        };
        window.plugins.actionsheet.show(options, callback);
    };
        
    $scope.dialogs = {};
    $scope.show = function(dlg) {
        if (!$scope.dialogs[dlg]) {
            ons.createDialog(dlg).then(function(dialog) {
                $scope.dialogs[dlg] = dialog;
                dialog.show();
            });
        }
        else {
            $scope.dialogs[dlg].show();
        }
    };

}]);

