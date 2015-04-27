'use strict';

describe('cordovaStrategy', function () {
    var $httpBackend,
        $window,
        element;

    beforeEach(function () {
        angular.module('angular-connect.test', {}).run(function ($q, connect, cordovaStrategy, alwaysStrategy, ngRouteFramework) {

            connect.framework(ngRouteFramework);
            connect.use(new cordovaStrategy({
                provider: 'facebook',
                params: ['622409984505970', ['email']]
            }));

            alwaysStrategy.login.andCallFake(function () {
                return $q.when().then(function () {
                    return $q.when({name: 'toto'})
                })
            })
            connect.use('always', alwaysStrategy);
        });
    });

    beforeEach(module('angular-connect.test', {
        alwaysStrategy: jasmine.createSpyObj('alwaysStrategy', ['login']),
        failStrategy: jasmine.createSpyObj('failStrategy', ['login'])
    }));

    beforeEach(function () {
        $window = {location: {replace: jasmine.createSpy()}};

        module(function ($provide) {
            $provide.value('$window', $window);
        });
    });

    beforeEach(function () {
        module('angular-connect', 'angular-connect-cordova', 'angular-connect.test')
    });

    beforeEach(module(function ($routeProvider) {
        $routeProvider.when('/Login', {
            id: 'login'
        });

        $routeProvider.when('/Home', {
            id: 'home'
        })
    }));

    afterEach(inject(function (connect) {
        connect.logout();
    }));

    it('it should redirect to authorization Url', function () {

        module(function ($routeProvider) {
            $routeProvider.when('/secure', {
                id: 'secure',
                resolve: {
                    isLogged: function (connect) {
                        return connect.login('cordova');
                    }
                }
            });
        });

        inject(function ($route, $location, $rootScope, $compile) {
            $rootScope.$apply(function () {
                $location.path('/secure');
            });

            expect($window.location.replace).toHaveBeenCalled();
        });
    });

    it('it should validate code', function () {

        module(function ($routeProvider) {
            $routeProvider.when('/secure/callback', {
                id: 'secure_callback',
                resolve: {
                    connect: function (connect) {
                        return connect.login('cordova');
                    }
                }
            });
        });

        inject(function ($route, $location, $rootScope, $compile) {
            $rootScope.$apply(function () {
                $location.search({code: '1234'}).path('secure/callback');
            });

            expect($location.path()).toBe('/secure/callback');
        });
    });
});