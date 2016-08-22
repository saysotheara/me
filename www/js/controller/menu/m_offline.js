// This is a JavaScript file

app.controller('OfflineController', ['$rootScope', '$scope', 'service', 'localStorageService', function($rootScope, $scope, service, localStorageService) {

    $scope.$on('refresh: loadOfflineMusicPlaylist', function(){
        $scope.grid   = 'hide';
        $scope.choice = 'offline';
        $scope.select = 'offline_mode';
        $scope.pageTitle  = service.selected_playlist.name;
        $scope.collection = $scope.pageTitle;

        $scope.limitToMusic = 60;
        $scope.musics = service.getLocalStorageItems('offline_playlists_' + service.selected_playlist.id);
        $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
    });

    $scope.$on('refresh: loadOfflineHistory', function(){
        $scope.grid   = 'hide';
        $scope.choice = 'offline';
        $scope.select = 'offline_history';
        $scope.pageTitle  = 'Offline History';
        $scope.collection = $scope.pageTitle;

        $scope.limitToMusic = 60;
        $scope.musics = service.getLocalStorageItems('offline_played');
        if ($scope.musics.length > 0) {
            $scope.musics = $scope.musics.reverse();
        }
        $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
    });

    $scope.$on('refresh: offline_history', function(){
        if ($scope.select === 'offline_history') {
            $scope.musics.splice(0, 0, service.playedMusic_offline);
            $scope.$apply();
        }
    });

    // Offline Mode - Playlist detail
    $scope.onButtonClick_Offline = function(item, itemIndex) {
        if ($scope.select === 'offline_history') {
            var callback = function(index) {
                if (index == 1) {
                    service.selected_music = item;
                    service.offline_playlists = service.getLocalStorageItems('offline_playlists');
                    service.isOfflinePlaylist = true;
                    if (service.offline_playlists.length === 0) {
                        service.isAddToMyPlaylist = true;
                        $scope.show('new_playlist.html');
                    }
                    else {
                        $scope.show('dialog_offline_playlist.html');
                    }
                }
            };
            var options = {
                'title' : item.title,
                'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
                'buttonLabels': ['Add to Offline Playlist..'],
                'androidEnableCancelButton' : true,
                'addCancelButtonWithLabel': 'Cancel',
                'position': [20, 40]
            };
            window.plugins.actionsheet.show(options, callback);
            return;
        }

        var callback = function(index) {
            if (index == 1) {
                if (service.showPlayer) {
                    // Add to Music Player
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
                    service.play_exception = true;
                    $scope.onMusicSelect(item, itemIndex);
                }
            }
            // Remove from Offline Playlist
            else if (index == 2) {
                if (buttonPlaylist === 'Remove from Offline Playlist') {
                    $scope.musics.splice(itemIndex, 1);
                    $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
                    localStorageService.set('offline_playlists_' + service.selected_playlist.id, $scope.musics);
                    window.plugins.toast.showShortCenter('Deleted Music from Offline Playlist.');
                    $scope.$apply();
                }
                else {
                    service.selected_music = item;
                    service.offline_playlists = service.getLocalStorageItems('offline_playlists');
                    service.isOfflinePlaylist = true;
                    if (service.offline_playlists.length === 0) {
                        service.isAddToMyPlaylist = true;
                        $scope.show('new_playlist.html');
                    }
                    else {
                        $scope.show('dialog_offline_playlist.html');
                    }                    
                }
            }
            // Delete from My Device
            else if (index == 3) {
                $scope.musics.splice(itemIndex, 1);
                $scope.showNoItem = ($scope.musics.length === 0) ? true : false;
                var offline_musics = service.getLocalStorageItems('offline_musics');
                for(i=0; i<offline_musics.length; i++) {
                    if (offline_musics[i].id === item.id) {
                        offline_musics.splice(i, 1);
                        localStorageService.set('offline_musics', offline_musics);
                        break;
                    }
                }
                var offline_playlists = service.getLocalStorageItems('offline_playlists');
                for(i=0; i<offline_playlists.length; i++) {
                    var offline_playlists_detail = service.getLocalStorageItems('offline_playlists_' + offline_playlists[i].id);
                    for(j=0; j<offline_playlists_detail.length; j++) {
                        if (offline_playlists_detail[j].id === item.id) {
                            offline_playlists_detail.splice(j, 1);
                            localStorageService.set('offline_playlists_' + offline_playlists[i].id, offline_playlists_detail);
                            break;
                        }
                    }
                }
                service.musics = service.getLocalStorageItems('offline_musics');
                $scope.$apply();
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
        var buttonPlaylist = 'Remove from Offline Playlist';
        var buttonDownload = 'Delete from My Device';
        if (service.showPlayer) {
            buttonMusic = 'Add to Up Next';
        }
        if ($scope.select === 'offline_search') {
            var buttonPlaylist = 'Add to Offline Playlist..';
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

}]);

