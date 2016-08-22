// This is a JavaScript file

app.controller('ProfileController', ['$rootScope', '$scope', 'service', 'localStorageService', '$cordovaOauth', function($rootScope, $scope, service, localStorageService, $cordovaOauth) {

    $scope.$on('event: onMyMusicAdd', function(){
        var data = { 
            music_id  : service.saved_music.id,
            title     : service.saved_music.title,
            uuid      : device.uuid
        };
        service.cloudAPI.liveMusicSaveAdd( data )
            .success( function(result, status){
                if (service.musics_favorite) {
                    if (service.musics_favorite.length === 0) {
                        service.musics_favorite = [];
                    }
                    service.musics_favorite.splice(0, 0, service.saved_music);
                    if ($scope.musics_favorite) {
                        $scope.musics_favorite = service.musics_favorite;
                    }
                }
            })
            .finally( function() {
                service.shouldReload_favorite = true;
                window.plugins.toast.showShortCenter('Added to My Music successfully.');
            }
        );
    });
    
    $scope.musicOptions = [
        {icon: 'history', name: 'History', desc: 'ចម្រៀងបានស្ដាប់'},
        {icon: 'music', name: 'For Me', desc: 'Music For Me'},
        {icon: 'heart', name: 'My Music', desc: 'My Music'},
        {icon: 'cloud-download', name: 'Download', desc: 'បានទាញយក'}
    ];
    
    ons.ready(function() {
        $scope.profile = {
            fid     : '',
            name    : 'Connect to Facebook',
            gender  : '',
            email   : 'Click here to link your account',
            image_s : '',
            image_l : '',
            uuid    : 'For unique experience across devices..'
        };
        if (service.getLocalStorageItems('profile') !== '') {
            $scope.profile = service.getLocalStorageItems('profile');
        }
    });

    $scope.stats = {
        n_played_music  : 0,
        n_liked_music   : 0,
        n_played_mv     : 0,
        n_downloaded    : 0
    };

    $scope.onOptionSelect_profile = function(item, index) {
        service.selected_profile_item = $scope.musicOptions[index].desc;
        switch(index) {
            case 0:
                service.detail = 'music_by_history';
                app.navi.pushPage('detail.html');
                break;
            case 1:
                service.detail = 'music_for_you';
                app.navi.pushPage('detail.html');
                break;
            case 2:
                service.detail = 'music_by_favorite';
                app.navi.pushPage('detail.html');
                break;
            case 3:
                service.detail = 'music_by_download';
                app.navi.pushPage('detail.html');
                break;
            default:
        }
    };
    
    $scope.$on('refresh: loadProfile', function() {
        $scope.grid = 'hide';
        $scope.choice = 'profile';
        $scope.select = 'online';
        $scope.pageTitle = "ME";
        
        $scope.stats = {
            n_played_music  : 0,
            n_liked_music   : 0,
            n_played_mv     : 0,
            n_downloaded    : 0
        };
        service.cloudAPI.liveProfileStats( { uuid: device.uuid } )
            .success( function(result) {
                $scope.stats = {
                    n_played_music  : result[0].music_view,
                    n_played_mv     : result[0].mv_view,
                    n_liked_music   : result[0].liked,
                    n_downloaded    : result[0].download
                };
            }
        );
        $scope.offline_playlists = service.getLocalStorageItems('offline_playlists');

        $scope.my_playlists = '';
        if (navigator.connection.type !== Connection.NONE) {
            if (service.my_playlists) {
                $scope.my_playlists = service.my_playlists;
            }
            else {
                service.cloudAPI.liveMusicPlaylistList( { uuid: device.uuid } )
                    .success( function(result) {
                        $scope.my_playlists = result;
                        service.my_playlists = result;
                    }
                );
            }
        }
        else {
            $scope.select = 'offline';
            $scope.showNoItem = ($scope.offline_playlists.length === 0) ? true : false;
        }
        
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
    });
       
    $scope.onUserProfileClick = function() {
        if (service.getLocalStorageItems('profile') !== '') {
            service.detail = 'connect';
            app.navi.pushPage('detail.html');
            // $scope.onFacebookClick();
        }
        else {
            $cordovaOauth.facebook('559502584217995', ['email', 'public_profile', 'user_friends'])
                .then( function(result) {
                    localStorageService.set('access_token', result.access_token);
                    service.cloudAPI.getUserData( { access_token: result.access_token } )
                        .success( function(result) {
                            $scope.profile = {
                                fid     : result.id,
                                name    : result.name,
                                gender  : result.gender,
                                email   : result.email,
                                image_s : result.picture.data.url,
                                image_l : 'https://graph.facebook.com/' + result.id + '/picture?width=200&height=200',
                                uuid    : device.uuid
                            };
                            localStorageService.set('profile', $scope.profile);
                            service.cloudAPI.liveProfileAdd( $scope.profile );
                            $rootScope.$broadcast('refresh: profile');
                        }
                    );
                }
            );
        }
    };
    
    $scope.onSelectPlaylistClick_profile = function(playlist) {
        $scope.select = playlist;
        $scope.isLoading = false;
        if (playlist === 'online') {
            $scope.showNoItem = ($scope.my_playlists.length === 0) ? true : false;
        }
        if (playlist === 'offline') {
            $scope.showNoItem = ($scope.offline_playlists.length === 0) ? true : false;
        }
        if (playlist === 'feature') {
            $scope.showNoItem = ($scope.feature_playlists.length === 0) ? true : false;
        }
    };

}]);


