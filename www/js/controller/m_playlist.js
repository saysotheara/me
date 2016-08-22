// This is a JavaScript file

app.controller('MyPlaylistController', ['$rootScope', '$scope', 'service', 'localStorageService', function($rootScope, $scope, service, localStorageService) {

    $scope.isHidden = false;
    $scope.onTogglePlaylistClick = function() {
        $scope.isHidden = !$scope.isHidden;
    };
        
    $scope.$on('refresh: my_playlists', function() {
        $scope.my_playlists = service.my_playlists;
        $scope.showNoItem = ($scope.my_playlists.length === 0) ? true : false;
    });
    
    $scope.$on('refresh: offline_playlists', function() {
        $scope.offline_playlists = service.offline_playlists;
        $scope.showNoItem = ($scope.offline_playlists.length === 0) ? true : false;
    });
    
    $scope.onPlaylistAdd = function() {
        service.isAddToMyPlaylist = false;
        service.isOfflinePlaylist = false;
        $scope.show('new_playlist.html');
        $rootScope.$broadcast('refresh: isOfflinePlaylist');
    };

    $scope.onOfflinePlaylistAdd = function() {
        service.isAddToMyPlaylist = false;
        service.isOfflinePlaylist = true;
        $scope.show('new_playlist.html');
        $rootScope.$broadcast('refresh: isOfflinePlaylist');
    };

    $scope.onMyPlaylistSelect = function(item, itemIndex) {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        service.selected_playlist = item;
        service.selected_playlist_feature = false;
        service.detail = 'music_by_playlist';
        app.navi.pushPage('detail.html');
    };

    $scope.onFeaturePlaylistSelect = function(item, itemIndex) {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        service.selected_playlist = item;
        service.selected_playlist_feature = true;
        service.detail = 'music_by_playlist';
        app.navi.pushPage('detail.html');
    };
    
    $scope.onOfflinePlaylistSelect = function(item, itemIndex) {
        service.selected_playlist = item;
        service.detail = 'music_by_playlist_offline';
        app.navi.pushPage('detail.html');
    };
    
    $scope.onPlaylistButtonClick = function(item, itemIndex) {
        var callback = function(index) {
            if (index == 1) {
                $scope.onMyPlaylistSelect(item, itemIndex);
            }
            else if (index == 2) {
                service.isOfflinePlaylist = false;
                service.selected_playlist = item;
                service.selected_playlist_index = itemIndex;
                $scope.show('update_playlist.html');
                $rootScope.$broadcast('refresh: isOfflinePlaylist');
            }
            else if (index == 3) {
                service.cloudAPI.liveMusicPlaylistDelete( { name: item.name, uuid: device.uuid } )
                    .success( function(result) {
                        $scope.my_playlists.splice(itemIndex, 1);
                        service.my_playlists = $scope.my_playlists;
                        $scope.showNoItem = ($scope.my_playlists.length === 0) ? true : false;
                    }
                );
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
    
    $scope.onOfflinePlaylistButtonClick = function(item, itemIndex) {
        var callback = function(index) {
            if (index == 1) {
                $scope.onOfflinePlaylistSelect(item, itemIndex);
                $scope.$apply();
            }
            else if (index == 2) {
                service.isOfflinePlaylist = true;
                service.selected_playlist = item;
                service.selected_playlist_index = itemIndex;
                $scope.show('update_playlist.html');
                $rootScope.$broadcast('refresh: isOfflinePlaylist');
            }
            else if (index == 3) {
                $scope.offline_playlists.splice(itemIndex, 1);
                service.offline_playlists = $scope.offline_playlists;
                localStorageService.set('offline_playlists', $scope.offline_playlists);
                $rootScope.$broadcast('refresh: offline_playlists');
                $scope.showNoItem = ($scope.offline_playlists.length === 0) ? true : false;
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

    $scope.$on('event: onPlaylistMusicAdd', function() {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        service.isOfflinePlaylist = false;
        if (service.my_playlists && service.my_playlists.length > 0) {
            $scope.show('my_playlist.html');
            $rootScope.$broadcast('refresh: isOfflinePlaylist');
            return;
        }
        service.cloudAPI.liveMusicPlaylistList( { uuid: device.uuid } )
            .success( function(result) {
                service.my_playlists = result;
            })
            .finally( function() {
                if (service.my_playlists.length === 0) {
                    service.isAddToMyPlaylist = true;
                    $scope.show('new_playlist.html');
                    $rootScope.$broadcast('refresh: isOfflinePlaylist');
                }
                else {
                    $scope.show('my_playlist.html');
                }
            }
        );
    });
    
    $scope.$on('event: onOfflinePlaylistMusicAdd', function() {
        var offline_playlists = service.getLocalStorageItems('offline_playlists');
        service.isOfflinePlaylist = true;
        if (offline_playlists.length === 0) {
            service.isAddToMyPlaylist = true;
            $scope.show('new_playlist.html');
            $rootScope.$broadcast('refresh: isOfflinePlaylist');
        }
        else {
            $scope.show('dialog_offline_playlist.html');
        }
    });

    $scope.$on('event: onOfflinePlaylistMusicDelete', function() {
        if (service.deleted_music === 'all') {
            var offline_playlists = service.getLocalStorageItems('offline_playlists');
            for(i=0; i<offline_playlists.length; i++) {
                localStorageService.remove('offline_playlists_' + offline_playlists[i].id);
            }
        }
        else {
            var offline_playlists = service.getLocalStorageItems('offline_playlists');
            for(i=0; i<offline_playlists.length; i++) {
                var offline_playlists_detail = service.getLocalStorageItems('offline_playlists_' + offline_playlists[i].id);
                for(j=0; j<offline_playlists_detail.length; j++) {
                    if (offline_playlists_detail[j].id === service.deleted_music.id) {
                        offline_playlists_detail.splice(j, 1);
                        localStorageService.set('offline_playlists_' + offline_playlists[i].id, offline_playlists_detail);
                        break;
                    }
                }
            }
        }
    });

    $scope.$on('refresh: loadMyPlaylist', function() {
        $scope.grid         = 'hide';
        $scope.choice       = 'my_playlist';
        $scope.select       = 'my_playlist';
        $scope.pageTitle    = 'My Music Playlist';
        $scope.showNoItem   = false;
        
        if (service.my_playlists) {
            $scope.my_playlists = service.my_playlists;
            $scope.showNoItem = ($scope.my_playlists.length === 0) ? true : false;
            
            $scope.feature_playlists = '';
            if (service.feature_playlists) {
                $scope.feature_playlists = service.feature_playlists;
            }
            else {
                service.cloudAPI.liveMusicPlaylistFeatureList()
                    .success( function(result) {
                        $scope.feature_playlists = result;
                        service.feature_playlists = result;
                    }
                );
            }
            
            return;
        }
        
        $scope.my_playlists = '';
        $scope.isLoading  = true;
        service.cloudAPI.liveMusicPlaylistList( { uuid: device.uuid } )
            .success( function(result) {
                $scope.my_playlists = result;
                service.my_playlists = result;
            })
            .finally( function() {
                $scope.isLoading = false;
                $scope.showNoItem = ($scope.my_playlists.length === 0) ? true : false;
            }
        );
        
        $scope.feature_playlists = '';
        service.cloudAPI.liveMusicPlaylistFeatureList()
            .success( function(result) {
                $scope.feature_playlists = result;
            }
        );        
    });

    /*
        Now Playlist controller
    */
    
    $scope.isRepeat  = true;
    $scope.isShuffle = false;
    $scope.isStarting = false;
    
    $scope.$on('refresh: loadPlaylist', function() {
        $scope.grid         = 'hide';
        $scope.choice       = 'playlist';
        $scope.select       = 'playlist';
        $scope.pageTitle    = 'ស្ដាប់កំសាន្ត';
        $scope.isChecking   = false;
        $scope.limitToMusic = 30;
        service.selectArtist = false;
        $scope.music_playlists = service.music_playlists;
        $scope.switchIcon = 'list-alt';
    });

    $scope.$on('refresh: reloadPlaylist', function() {
        $scope.isRepeat  = false;
        $scope.isShuffle = false;
        service.isRepeat  = $scope.isRepeat;
        service.isShuffle = $scope.isShuffle;
    });

    $scope.onPlaylistSelect = function(item, itemIndex) {
        if (item.src.indexOf('superean.com') === -1) {
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
        }
        else {
            service.track = itemIndex;
            service.playedMusic = item;
            $scope.musicNow = service.playedMusic;
            $rootScope.$broadcast('refresh: musicSelected');
            $scope.isStarting = true;
            setTimeout(function(){
                $scope.isStarting = false;
            }, 1500);
        }
    };

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
        if ($scope.musicNow.src.indexOf('superean') > -1) {
            $rootScope.$broadcast('event: onPlaylistMusicAdd');
        }
        else {
            $rootScope.$broadcast('event: onOfflinePlaylistMusicAdd');
        }
    };
    
    $scope.onButtonClick_playlist = function(item, itemIndex) {
        if (navigator.connection.type === Connection.NONE) {
            var callback_offline = function(index) {
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
            var options_offline = {
                'title' : item.title,
                'androidTheme' : window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
                'buttonLabels': ['Remove this Music', 'Add to Offline Playlist..'],
                'androidEnableCancelButton' : true,
                'addCancelButtonWithLabel': 'Cancel',
                'position': [20, 40]
            };
            window.plugins.actionsheet.show(options_offline, callback_offline);
            return;
        };
        
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
                service.saved_music = item;
                $rootScope.$broadcast('event: onMyMusicAdd');
            }
            else if (index == 3) {
                service.selected_music = item;
                if (buttonPlaylist === 'Add to My Playlist..') {
                    $rootScope.$broadcast('event: onPlaylistMusicAdd');
                }
                else {
                    $rootScope.$broadcast('event: onOfflinePlaylistMusicAdd');
                }
            }
            else if (index == 4 && item.src.indexOf('superean.com') > -1 && service.showTV) {
                service.downloadedMusic = item;
                $rootScope.$broadcast('event: onDownloadMusicAdd');
            }
        };
        var buttonFavorite = 'Add to My Music';
        var buttonPlaylist = 'Add to My Playlist..';
        var buttonDownload = 'Download this Music';
        var options = {
            'title' : item.title,
            'androidTheme' : window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
            'buttonLabels': ['Remove this Music', buttonFavorite, buttonPlaylist, buttonDownload],
            'androidEnableCancelButton' : true,
            'addCancelButtonWithLabel': 'Cancel',
            'position': [20, 40]
        };
        if (!service.showTV) {
            options = {
                'title' : item.title,
                'androidTheme' : window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
                'buttonLabels': ['Remove this Music', buttonFavorite, buttonPlaylist],
                'androidEnableCancelButton' : true,
                'addCancelButtonWithLabel': 'Cancel',
                'position': [20, 40]
            };
        }
        if (item.src.indexOf('superean.com') === -1) {
            var buttonPlaylist = 'Add to Offline Playlist..';
            options = {
                'title' : item.title,
                'androidTheme' : window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
                'buttonLabels': ['Remove this Music', buttonFavorite, buttonPlaylist],
                'androidEnableCancelButton' : true,
                'addCancelButtonWithLabel': 'Cancel',
                'position': [20, 40]
            };
        }
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

app.controller('DialogPlaylistController', ['$rootScope', '$scope', 'service', 'localStorageService', function($rootScope, $scope, service, localStorageService) {
    
    $scope.required = 'none';
    $scope.playlist_name = '';
    
    $scope.$on('refresh: my_playlists', function() {
        $scope.my_playlists = service.my_playlists;
    });
    $scope.$on('refresh: offline_playlists', function() {
        $scope.offline_playlists = service.getLocalStorageItems('offline_playlists');
    });
    $scope.$on('refresh: isOfflinePlaylist', function() {
        $scope.isOfflinePlaylist = service.isOfflinePlaylist;
    });

    $scope.my_playlists = service.my_playlists;
    $scope.offline_playlists = service.getLocalStorageItems('offline_playlists');
    $scope.isOfflinePlaylist = service.isOfflinePlaylist;

    $scope.onPlaylistSelect = function(item, index) {
        var music = {
            id          : service.selected_music.id,
            title       : service.selected_music.title,
            title_en    : service.selected_music.title_en,
            artist      : service.selected_music.artist,
            artist_en   : service.selected_music.artist_en,
            url         : service.selected_music.url,
            thumb       : service.selected_music.thumb,
            album       : service.selected_music.album,
            type        : service.selected_music.type,
            view        : service.selected_music.view,
            liked       : service.selected_music.liked,
            download    : service.selected_music.download,
            size        : service.selected_music.size,
            playlist_id : item.id,
            uuid        : device.uuid,
            offline     : 'true'
        };
        if ($scope.isOfflinePlaylist) {
            var offline_playlist_detail = service.getLocalStorageItems('offline_playlists_' + item.id);
            if (offline_playlist_detail.length === 0) {
                offline_playlist_detail = [];
            }
            var isMusicExist = false;
            for(i=0; i<offline_playlist_detail.length; i++) {
                if (offline_playlist_detail[i].id === service.selected_music.id) {
                    window.plugins.toast.showShortCenter('Already added to Offline Playlist.');
                    isMusicExist = true;
                    break;
                }
            }
            if (!isMusicExist) {
                offline_playlist_detail.splice(0, 0, music);
                service.selected_playlist_id = item.id;
                localStorageService.set('offline_playlists_' + item.id, offline_playlist_detail);
                $rootScope.$broadcast('refresh: added_to_my_playlist_done');
                window.plugins.toast.showShortCenter('Added Music to Offline Playlist successfully.');
            }
        }
        else {
            music = {
                music_id    : service.selected_music.id,
                playlist_id : item.id,
                uuid        : device.uuid
            };
            service.cloudAPI.liveMusicPlaylistDetailAdd( music )
                .success( function(result) {
                    service.selected_playlist_id = item.id;
                    $rootScope.$broadcast('refresh: added_to_my_playlist_done');
                    window.plugins.toast.showShortCenter('Added Music to the Playlist successfully.');
                })
                .error( function() {
                    window.plugins.toast.showShortCenter('Already added to the Playlist.');
                }
            );
        }
        $scope.dialog.hide();
    };

    var generateUid = function (separator) {
        var delim = separator || "-";
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return (S4() + S4() + delim + S4() + delim + S4() + delim + S4() + delim + S4() + S4() + S4());
    };

    $scope.onCreateClick = function() {
        if ($scope.playlist_name.length >= 2 && $scope.playlist_name.length <= 20) {
            if (service.isOfflinePlaylist) {
                var isPlaylistExist = false;
                $scope.offline_playlists = service.getLocalStorageItems('offline_playlists');
                for(i=0; i<$scope.offline_playlists.length; i++) {
                    if ($scope.offline_playlists[i].name === $scope.playlist_name) {
                        window.plugins.toast.showShortCenter('Offline Playlist already exists...');
                        isPlaylistExist = true;
                        break;
                    }
                }
                if (!isPlaylistExist) {
                    var playlist = {
                        id      : generateUid(),
                        uuid    : device.uuid, 
                        name    : $scope.playlist_name 
                    };
                    if ($scope.offline_playlists.length === 0) {
                        $scope.offline_playlists = [];
                    }
                    $scope.dialog_new.hide();
                    $scope.offline_playlists.push(playlist);
                    service.offline_playlists = $scope.offline_playlists;
                    localStorageService.set('offline_playlists', service.offline_playlists);
                    $rootScope.$broadcast('refresh: offline_playlists');
                    if (service.isAddToMyPlaylist) {
                        $scope.onPlaylistSelect(playlist, 0);
                    }
                }
            }
            else {
                service.cloudAPI.liveMusicPlaylistAdd( { name: $scope.playlist_name, uuid: device.uuid } )
                    .success( function(result) {
                        var playlist = {
                            id      : result, 
                            uuid    : device.uuid, 
                            name    : $scope.playlist_name 
                        };
                        if ($scope.my_playlists.length === 0) {
                            $scope.my_playlists = [];
                        }
                        $scope.dialog_new.hide();
                        $scope.my_playlists.push(playlist);
                        service.my_playlists = $scope.my_playlists;
                        $rootScope.$broadcast('refresh: my_playlists');
                        if (service.isAddToMyPlaylist) {
                            $scope.onPlaylistSelect(playlist, 0);
                        }
                    })
                    .error( function() {
                        window.plugins.toast.showShortCenter('The Playlist already exists...');
                    }
                );
            }
        }
        else {
            $scope.required = 'true';
            $scope.playlist_name = '';
            window.plugins.toast.showShortCenter('Please enter a valid playlist name...');
        }
    };

    $scope.onUpdateClick = function() {
        if ($scope.new_playlist_name.length >= 2 && $scope.new_playlist_name.length <= 20) {
            if ($scope.isOfflinePlaylist) {
                var isPlaylistExist = false;
                service.offline_playlists = service.getLocalStorageItems('offline_playlists');;
                for(i=0; i<service.offline_playlists.length; i++) {
                    if (service.offline_playlists[i].name === $scope.new_playlist_name) {
                        window.plugins.toast.showShortCenter('Offline Playlist already exists...');
                        isPlaylistExist = true;
                        break;
                    }
                }
                if (!isPlaylistExist) {
                    service.offline_playlists[service.selected_playlist_index].name = $scope.new_playlist_name;
                    localStorageService.set('offline_playlists', service.offline_playlists);
                    $rootScope.$broadcast('refresh: offline_playlists');
                    $scope.dialog_update.hide();
                }
                return;
            }
            service.cloudAPI.liveMusicPlaylistUpdate( { id: service.selected_playlist.id, name: $scope.new_playlist_name, uuid: device.uuid } )
                .success( function(result) {
                    $scope.my_playlists[service.selected_playlist_index].name = $scope.new_playlist_name;
                    service.my_playlists = $scope.my_playlists;
                    $rootScope.$broadcast('refresh: my_playlists');
                    $scope.dialog_update.hide();
                })
                .error( function() {
                    window.plugins.toast.showShortCenter('New Playlist name already exists...');
                }
            );
        }
        else {
            $scope.required = 'true';
            $scope.new_playlist_name = '';
            window.plugins.toast.showShortCenter('Please enter a valid playlist name...');
        }
    };

    $scope.onFocus = function() {
        $scope.required = 'none';
    };

    $scope.onDialogHide = function() {
        $scope.required = 'none';
        $scope.playlist_name = '';
    };

    $scope.onDialogShow = function() {
        $scope.required = 'none';
        $scope.new_playlist_name = '';
        $scope.playlist_name = service.selected_playlist.name;
        $scope.isOfflinePlaylist = service.isOfflinePlaylist;
        $scope.offline_playlists = service.getLocalStorageItems('offline_playlists');
    };

}]);

