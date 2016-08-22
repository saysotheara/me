// This is a JavaScript file

app.controller('WatchController', ['$rootScope','$scope', 'service', '$controller', 'localStorageService', function($rootScope, $scope, service, $controller, localStorageService) {
        
    angular.extend(this, $controller('Controller', {$scope: $scope}));

    service.page = 'video';

    $scope.items = (service.items) ? service.items : '';

    if ($scope.showTV) {
        $scope.choice = 1;
        $scope.showNoItem = ($scope.items.length === 0) ? true : false;
    }
    else {
        $scope.choice = 2;
    }

    if (service.whichTab === 'tv') {
        $scope.choice = 1;
        service.whichTab = '';
    }
    if (service.whichTab === 'radio') {
        $scope.choice = 3;
        service.whichTab = '';
    }
    
    $scope.productions = service.productions;

    $scope.musicOptions = [
        {icon: 'file-archive-o', desc: 'ផលិតកម្ម'},
        {icon: 'file-video-o', desc: 'ខារ៉ាអូខេ'},
        {icon: 'search', desc: 'ស្វែងរក'},
        {icon: 'cloud-download', desc: 'ទាញយក'}
    ];

    $scope.onOptionSelect = function(item, index) {
        switch(index) {
            case 0:
                service.selected_prod = '';
                $scope.app.slidingMenu.toggleMenu();
                $rootScope.$broadcast('refresh: loadAllMV');        
                break;
            case 1:
                $scope.app.slidingMenu.toggleMenu();
                $rootScope.$broadcast('refresh: loadMVideo');
                break;
            case 2:
                $scope.app.slidingMenu.toggleMenu();
                $rootScope.$broadcast('refresh: loadSearch');
                break;
            case 3:
                $scope.app.slidingMenu.toggleMenu();
                $rootScope.$broadcast('refresh: loadDownload');
                break;
            default:
        }
    };
    
    if (service.mvs) {
        $scope.mvs = service.mvs;
    }
    else {
        $rootScope.$broadcast('refresh: mvs');
    }
    
    $scope.onTVClick = function() {
        $scope.choice = 1;
        $scope.showNoItem = ($scope.items.length === 0) ? true : false;
    };

    $scope.onMVClick = function() {
        $scope.choice = 2;
        $scope.showNoItem = false;
        if (service.mvs) {
            $scope.mvs = service.mvs;
            $scope.showNoItem = ($scope.mvs.length === 0) ? true : false;
        }
        else {
            $scope.isLoading = true;
            service.cloudAPI.liveMVList()
                .success( function(result) {
                    $scope.mvs = result;
                    service.mvs = result;
                })
                .finally( function() {
                    $scope.isLoading = false;
                    $scope.showNoItem = ($scope.mvs.length === 0) ? true : false;
                }
            );
        }
    };

    $scope.onSerieClick = function() {
        $scope.choice = 3;
        $scope.showNoItem = false;
        if (service.series) {
            $scope.series = service.series;
            $scope.showNoItem = ($scope.series.length === 0) ? true : false;
        }
        else {
            $scope.isLoading = true;
            service.cloudAPI.liveSerieList()
                .success( function(result) {
                    $scope.series = result;
                    service.series = result;
                })
                .finally( function() {
                    $scope.isLoading = false;
                    $scope.showNoItem = ($scope.series.length === 0) ? true : false;
                }
            );
        }
    };

    $scope.$on('event: onVideoTabClick', function() {
        if ($scope.showTV) {
            $scope.onTVClick();
        }
    });

    $scope.onSerieSelect = function(item) {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
        }
        else {
            service.selected_serie = item;
            $scope.app.slidingMenu.toggleMenu();
            $rootScope.$broadcast('refresh: loadSerie');
        }
    };

    $scope.onSeeAllMVClick = function(mv_prod) {
        service.selected_prod = mv_prod;
        $scope.app.slidingMenu.toggleMenu();
        $rootScope.$broadcast('refresh: loadAllMV');
    };

    $scope.onMVSelect = function(item) {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
        }
        else {
            service.selected_mv = item;
            $scope.app.slidingMenu.toggleMenu();
            $rootScope.$broadcast('refresh: loadMV');
            service.cloudAPI.liveMVViewAdd( { id: item.id, uuid: device.uuid } );
        }
    };
    
    $scope.filterMe = function(item){
        return item.type == 'radio' || item.type == 'music';
    };
    
    
}]);


