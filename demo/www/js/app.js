// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'angular-connect', 'angular-connect-uiRouter', 'angular-connect-cordova'])

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('login', {
                url: '/login',
                template: '<p>Login page</p>',
                resolve: {
                    isLogged: function (connect) {
                        return connect.login('cordova', {successReturnToOrRedirect: '/'});
                    }
                }
            })
            .state('secure', {
                url: '/secure',
                template: '<p>Secure page</p>',
                resolve: {
                    isLogged: function (connect) {
                        return connect.login('ensureLogin', {redirectTo: 'login'});
                    }
                }
            });
    })

    .run(function ($ionicPlatform, $q, connect, cordovaStrategy, ensureLoginStrategy, uiRouterFramework) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });

        connect.framework(uiRouterFramework);
        connect.use(new cordovaStrategy({
                provider: 'facebook',
                params: ['622409984505970', ['email']]
            }, function (data) {
                console.log('toto');
            })
        );
        connect.use(new ensureLoginStrategy());

    })
