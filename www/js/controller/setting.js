// This is a JavaScript file

app.controller('SettingController', ['$rootScope', '$scope', 'service', '$controller', 'localStorageService', function($rootScope, $scope, service, $controller, localStorageService) {
    
    angular.extend(this, $controller('Controller', {$scope: $scope}));
    angular.extend(this, $controller('SNSController', {$scope: $scope}));
    
    service.page = 'setting';
    
    $scope.onFeedClick = function() {
        $rootScope.$broadcast('refresh: feed');
        $scope.app.slidingMenu.toggleMenu();
    };

    $scope.onAboutClick = function() {
        $rootScope.$broadcast('refresh: about');
        $scope.app.slidingMenu.toggleMenu();
    };

    $scope.onContactClick = function() {
        $scope.onRateClick();
        
        // $rootScope.$broadcast('refresh: contact');
        // $scope.app.slidingMenu.toggleMenu();
    };

    ons.ready(function() {
        $scope.profile = {
            fid     : '',
            name    : 'My Profile',
            gender  : '',
            email   : 'Synchronize your music',
            image_s : '',
            image_l : '',
            uuid    : device.uuid
        };
        if (service.getLocalStorageItems('profile') !== '') {
            $scope.profile = service.getLocalStorageItems('profile');
        }
    });
    
    $scope.$on('refresh: profile', function(){
        if (service.getLocalStorageItems('profile') !== '') {
            $scope.profile = service.getLocalStorageItems('profile');
        }
    });
    
    $scope.onClearCacheClick = function() {
        var success = function(status) {
            window.plugins.toast.showShortCenter('Cache cleared successfully.');
        };
        var error = function(status) {
            window.plugins.toast.showShortCenter('Error: please try again...');
        };
        window.cache.clear( success, error );
    };

    $scope.isOnline = (navigator.connection.type === Connection.NONE) ? false : true;
    $scope.offline_musics = service.getLocalStorageItems('offline_musics');
    $scope.onDownloadStorageClick = function() {
        $rootScope.$broadcast('refresh: loadDownloadStorage');
        $scope.app.slidingMenu.toggleMenu();
    };
    
}]);



