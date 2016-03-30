angular.module('myApp', ['ui.router'])
.run(function($rootScope, $state) {
    $rootScope.header = {UserName:'paul@realtimesolutions.co.za', Password:'story', System:'RC'};
})
.config(function($stateProvider, $urlRouterProvider){
    $stateProvider
        .state('app', {
            url: "/app",
            abstract:true,
            templateUrl: "components/shared/menu/menuView.html",
            controller: 'appCtrl'            
        })

        .state('app.home', {
            url:'/home',
            views: {
                'main': {
                    controller: 'homeCtrl',
                    templateUrl:'components/home/homeView.html'
                }
            }
        })
        .state('app.settings', {
            url:'/settings',
            views: {
                'main': {
                    controller: 'settingsCtrl',
                    templateUrl:'components/settings/settingsView.html'
                }
            }
        })        


     $urlRouterProvider.otherwise('app/home');
});



