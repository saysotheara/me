// This is a JavaScript file

app.controller('LiveController', ['$rootScope', '$scope', 'service', 'localStorageService', function($rootScope, $scope, service, localStorageService) {

    $scope.$on('refresh: loadArchive', function(){
        $scope.grid = 'show';
        $scope.choice = "archive";
        $scope.isShowGrid = false;
        
        $scope.items = [];
        $scope.pageTitle = 'ការផ្សាយប្រចាំថ្ងៃ';
        $scope.radioName = service.item.name;
        
        var currentDate = new Date();
        
        for( i=1; i<=10; i++) {
            var url  = '';
            var date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - i);
            if (service.item.name.indexOf("RFI") > -1) {
                url  = service.item.url + date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + '.mp3';
            }
            else if(service.item.name.indexOf("RFA") > -1) {
                url  = service.item.url + date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + '-2230.mp3';
            }
            else if(service.item.name.indexOf("Post") > -1) {
                url  = service.item.url + ("0" + date.getDate()).slice(-2) + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear() + '.mp3';
            }
            else if(service.item.name.indexOf("VOA") > -1) {
                url  = service.item.url + date.getFullYear() + '/' + ("0" + (date.getMonth() + 1)).slice(-2) + '/' + ("0" + date.getDate()).slice(-2) + '/' + date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + '-220000-VKH075-program.mp3';
            }
            else if(service.item.name.indexOf("Australia") > -1) {
                url  = service.item.url + date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + '.mp3';
            }
            else if(service.item.name.indexOf("VOD") > -1) {
                url  = service.item.url + ("0" + date.getFullYear()).slice(-2) + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + '-vod-thy-live-evening-news-' + date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2) + '.mp3';
            }
            else if(service.item.name.indexOf("National") > -1) {
                url  = service.item.url + date.getFullYear() + '/' + ("0" + (date.getMonth() + 1)).slice(-2) + '/' + ("0" + date.getDate()).slice(-2) + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear() + '%20PM.mp3';
            }
            else if(service.item.name.indexOf("World") > -1) {
                url  = service.item.url + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2) + '-' + ("0" + date.getFullYear()).slice(-2) + '_WKR_ALL_NEWS.mp3';
            }
            var item = { 
                date    : date, 
                url     : url,
                id      : service.item.id,
                name    : service.item.name,
                thumb   : service.item.thumb
            };
            $scope.items.push( item );
        }
        
    });
    
    $scope.onRadioSelect = function(live) {
        $rootScope.$broadcast('refresh: stopPlayer');
        var audioUrl = live.url;
        var options = {
            bgColor: "#28292a",
            bgImage: $scope.viewPath + '/' + live.thumb,
            bgImageScale: "center",
            successCallback: function() {
            },
            errorCallback: function(errMsg) {
                window.plugins.toast.showShortCenter('Archive is not available. Please try again later.');
            }
        };
        window.plugins.streamingMedia.playAudio(audioUrl, options);
        service.cloudAPI.liveViewAdd( { id: live.id, uuid: device.uuid } );
    };
    
    $scope.$on('refresh: loadSerie', function(){
        $scope.grid = 'show';
        $scope.choice = "serie";
        $scope.select = "serie";
        $scope.isShowGrid = true;
        $scope.pageTitle = service.selected_serie.serie;
        $scope.serieDesc = service.selected_serie.desc;

        $scope.items = '';
        $scope.isLoading = true;
        $scope.showNoItem = false;
        service.cloudAPI.liveSerieDetailList( { serie: service.selected_serie.serie } )
            .success( function(result, status){
                $scope.items = result;
            })
            .finally( function() {
                $scope.isLoading = false;
                $scope.showNoItem = ($scope.items.length === 0) ? true : false;
            }
        );
    });

    $scope.onPlaySelect = function(item) {
        if (navigator.connection.type === Connection.NONE) {
            window.plugins.toast.showShortCenter(service.messageNoInternet);
            return;
        }
        $rootScope.$broadcast('refresh: stopPlayer');        
        YoutubeVideoPlayer.openVideo( item.url );
        service.cloudAPI.liveSerieDetailViewAdd( { id: item.id, uuid: device.uuid } );
    };
    
}]);


