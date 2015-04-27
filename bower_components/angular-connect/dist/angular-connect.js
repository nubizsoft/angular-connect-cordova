/**
 * Authentication library for angular
 * @version v0.0.1-dev-2015-04-25
 * @link 
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

/* commonjs package manager support (eg componentjs) */
if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
  module.exports = 'angular-connect';
}

(function (window, angular, queryString, undefined) {
angular.module('angular-connect', ['ngRoute', 'ngCookies']);
angular.module('angular-connect')

    .provider('connect', function connectProvider() {
        var _userPropertyName = 'user',
            _strategies = {},
            _serializers = [],
            _framework = null;

        this.userPropertyName = function userPropertyName(name) {
            if (arguments.length > 0) {
                if (!angular.isString(name)) {
                    throw Error('userPropertyName should be a string');
                }

                _userPropertyName = name;
                return this;
            } else {
                return _userPropertyName;
            }
        };


        /**
         * @ngdoc object
         * @name angular-connect.connect
         *
         * @description
         *
         */
        this.$get = function $get($rootScope, $q) {
            return {
                login: function login(name, options) {
                    if (_framework == null) {
                        throw new Error('Framework is not defined');
                    }
                    console.log("connectInstance:login");
                    return _framework.login(name, options)
                        .then(function resolve(user) {
                            console.log("connectInstance:login:resolve");
                            $rootScope[_userPropertyName] = user;

                            var map = _serializers.map(function (serializer) {
                                return $q.when(user).then(serializer);
                            });

                            return $q.all(map);
                        });
                },

                logout: function login(name, options) {
                    if (_framework == null) {
                        throw new Error('Framework is not defined');
                    }

                    return $q.when(name).then(function (name) {
                        if (name) {
                            console.log(name);
                            return _framework.logout(name, options);
                        }
                    }).then(function resolve() {
                        delete $rootScope[_userPropertyName];

                        var map = _serializers.map(function (serializer) {
                            return $q.when().then(serializer);
                        });

                        return $q.all(map);
                    });
                },

                framework: function framework(value) {
                    _framework = value;
                    return this;
                },

                user: function user() {
                    return $rootScope[_userPropertyName];
                },

                use: function use(name, strategy) {
                    if (!strategy) {
                        strategy = name;
                        name = strategy.name;
                    }

                    if (!name) {
                        throw new Error('Authentication strategy must have a name');
                    }
                    _strategies[name] = strategy;
                    return this;
                },

                strategy: function strategy(name) {
                    var str = _strategies[name];
                    if (!str) {
                        throw new Error('Unknown identification strategy "' + name + '"');
                    }

                    return str;
                },

                unuse: function unuse(name) {
                    delete _strategies[name];
                    return this;
                },

                serializeUser: function serializeUser(fn) {
                    _serializers.push(fn);
                },

                isAuthenticated: function isAuthenticated() {
                    return ($rootScope[_userPropertyName]) ? true : false;
                },

                userPropertyName: function userPropertyName(){
                    return _userPropertyName;
                }
            };
        };
    });
angular.module('angular-connect')
    .factory('connectStrategy', function ($q) {

        var options = this.options = {};
        var connectStrategy = function (options) {
            console.log('connectStrategy:Constructor:options', options);
            this.options = options || {};
        };

        connectStrategy.prototype.login = function login(params, options) {
            return $q.when();
        };

        connectStrategy.prototype.logout = function logout(params, options) {
            return $q.when();
        };

        connectStrategy.prototype.serializeUser = function serializeUser() {
            return $q.when();
        };

        connectStrategy.prototype.deserializeUser = function serializeUser() {
            return $q.when();
        };

        return connectStrategy;
    });
angular.module('angular-connect')
    .factory('localStrategy', function cookiesStrategyProvider($q, connect, connectStrategy) {

        var defaults = {
            redirectTo: ''
        };

        var userPropertyName = connect.userPropertyName() || user;

        connect.serializeUser(function (user) {
            if (user) {
                localStorage[userPropertyName] = user;
            } else {
                localStorage.removeItem(userPropertyName);
            }
        });

        var localStrategy = function () {
            this.name = 'local';
        };

        localStrategy.prototype = new connectStrategy();

        localStrategy.prototype.login = function login(params, options) {

            options = options || {};
            options.redirectTo = options.redirectTo || defaults.redirectTo;

            return $q.when().then(function () {
                var deferred = $q.defer();

                var user = localStorage.getItem(userPropertyName);

                if (!user) {
                    deferred.reject({redirectTo: options.redirectTo});
                } else {
                    deferred.resolve();
                }

                return deferred.promise;
            });
        };

        return localStrategy;

    });
angular.module('angular-connect')
    .provider('cookiesStrategy', function cookiesStrategyProvider() {

        var defaults = {
            redirectTo: ''
        };

        this.$get = function $get($q, $cookieStore, connect, connectStrategy) {

            connect.serializeUser(function(user){
                if (user) {
                    $cookieStore.put('user', user);
                } else {
                    $cookieStore.remove('user');
                }
            });

            var cookiesStrategy = function (options) {
                this.name = 'cookies';

                options = angular.extend({}, options, defaults);
                connectStrategy.call(this.options);
            };

            cookiesStrategy.prototype = new connectStrategy();

            cookiesStrategy.prototype.login = function login(params, options) {

                options = options || {};
                options.redirectTo =  options.redirectTo || defaults.redirectTo;

                return $q.when().then(function(){
                    var deferred = $q.defer();

                    var user = $cookieStore.get('user');

                    if (!user){
                        deferred.reject({redirectTo: options.redirectTo});
                    } else {
                        deferred.resolve();
                    }

                    return deferred.promise;
                });
            };

            return cookiesStrategy;
        };

    });
angular.module('angular-connect')
    .factory('oauth2Strategy', function ($q, connect, connectStrategy) {

        var oauth2Strategy = function (options) {

            this.name = 'oauth2';
            connectStrategy.call(this, options);
        };

        oauth2Strategy.prototype = new connectStrategy();

        oauth2Strategy.prototype.login = function login(params, options) {
            var self = this;
            // callback with code or token
            if (params && (params.code || params.token)) {
                return this.validate(params).then(function(){
                    return self.promise;
                }).catch(function (error) {
                    var err = angular.extend({}, error, {
                        redirectTo: options.redirectTo || this.options.redirectTo
                    });
                    return $q.reject(err);
                });
            }

            // callback with an error
            if (params && params.error) {
                return $q.reject({
                    redirectTo: options.redirectTo || this.options.redirectTo,
                    error: params.error,
                    error_description: params.error_description,
                    error_uri: params.error_uri
                });
            }

            var query = queryString.stringify({
                client_id: this.options.clientID,
                redirect_uri: this.options.redirectURL,
                scope: this.options.scope,
                response_type: this.options.responseType
            });

            var url = this.options.authorizationURL + '?' + query;

            return $q.reject({redirectExt: url});
        };

        oauth2Strategy.prototype.validate = function validate(params) {
            return $q.when(params);
        };

        return oauth2Strategy;

    });
angular.module('angular-connect')
    .factory('sessionStrategy', function cookiesStrategyProvider($q, connect, connectStrategy) {

        var defaults = {
            redirectTo: ''
        };

        var userPropertyName = connect.userPropertyName() || user;

        connect.serializeUser(function (user) {
            if (user) {
                sessionStorage[userPropertyName] = user;
            } else {
                sessionStorage.removeItem(userPropertyName);
            }
        });

        var sessionStrategy = function () {
            this.name = 'session';
        };

        sessionStrategy.prototype = new connectStrategy();

        sessionStrategy.prototype.login = function login(params, options) {

            options = options || {};
            options.redirectTo = options.redirectTo || defaults.redirectTo;

            return $q.when().then(function () {
                var deferred = $q.defer();

                var user = sessionStorage.getItem(userPropertyName);

                if (!user) {
                    deferred.reject({redirectTo: options.redirectTo});
                } else {
                    deferred.resolve();
                }

                return deferred.promise;
            });
        };

        return sessionStrategy;

    });
angular.module('angular-connect')
    .factory('ensureLoginStrategy', function ($q, connect, connectStrategy) {

        var defaults = {
            redirectTo: ''
        };

        var ensureLoginStrategy = function (options) {

            this.name = 'ensureLogin';
            options = angular.extend({}, options, defaults);
            connectStrategy.call(this.options);

        };

        ensureLoginStrategy.prototype = new connectStrategy();

        ensureLoginStrategy.prototype.login = function login(params, options) {

            options = options || {};
            options.redirectTo =  options.redirectTo || defaults.redirectTo;

            return $q.when().then(function(){
                var deferred = $q.defer();

                if (!connect.isAuthenticated()){
                    deferred.reject({redirectTo: options.redirectTo});
                } else {
                    deferred.resolve();
                }

                return deferred.promise;
            });
        };

        return ensureLoginStrategy;
    });
angular.module('angular-connect')
    .factory('ensureLogoutStrategy', function ($q, connect, connectStrategy) {

        var defaults = {
            redirectTo: ''
        };

        var ensureLogoutStrategy = function (options) {
            this.name = 'ensureLogout';
            options = angular.extend({}, options, defaults);
            connectStrategy.call(this.options);
        };

        ensureLogoutStrategy.prototype = new connectStrategy();

        ensureLogoutStrategy.prototype.logout = function logout(params, options) {

            console.log('ensureLogoutStrategy:logout');

            options = options || {};
            options.redirectTo =  options.redirectTo || defaults.redirectTo;

            return $q.when().then(function(){
                var deferred = $q.defer();
                if (connect.isAuthenticated()){
                    console.log('ensureLogoutStrategy:logout:reject');
                    deferred.reject({redirectTo: options.redirectTo});
                } else {
                    deferred.resolve();
                }

                return deferred.promise;
            });
        };

        return ensureLogoutStrategy;
    });
angular.module('angular-connect')
    .service('ngRouteFramework', function ($window, $rootScope, connect, $location, $q, $routeParams) {

        $rootScope.$on('$routeChangeError', function (event, next, current, error) {

            if (error.redirectTo !== undefined) {
                console.log('redirectTo', error.redirectTo);
                $rootScope.$evalAsync(function () {
                    $location.path(error.redirectTo);
                });
            }

            if (error.redirectExt !== undefined) {
                //event.preventDefault();
                console.log('redirectExt', error.redirectExt);
                $rootScope.$evalAsync(function () {
                    $window.location.replace(error.redirectExt);
                });
            }

        });

        $rootScope.$on('$routeChangeSuccess', function (event, next, current, error) {
            console.log('success', error);
        });

        return {
            login: function (name, options) {
                if (!angular.isArray(name)) {
                    name = [name];
                }

                var promise;
                var params = $location.search();

                angular.forEach(name, function (strategyName, index) {
                    if (index === 0) {
                        promise = $q.when(connect.strategy(strategyName).login(params, options));
                    } else {
                        promise = promise.catch(function () {
                            return connect.strategy(strategyName).login(params, options);
                        });
                    }
                });

                return promise;
            },

            logout: function (name, options) {
                if (!angular.isArray(name)) {
                    name = [name];
                }

                var promise;

                angular.forEach(name, function (strategyName, index) {
                    if (index === 0) {
                        promise = $q.when(connect.strategy(strategyName).logout(options));
                    } else {
                        promise = promise.catch(function () {
                            return connect.strategy(strategyName).logout(options);
                        });
                    }
                });

                return promise;
            }
        };

    });
angular.module('angular-connect-uiRouter', ['angular-connect', 'ui.router'])
    .service('uiRouterFramework', function ($rootScope, connect, $location, $q) {

        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
            if (error.redirectTo !== undefined) {
                $rootScope.$evalAsync(function () {
                    $location.path(error.redirectTo);
                });
            }
        });

        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            console.log('success');
        });

        return {
            login: function (name, options) {
                if (!angular.isArray(name)) {
                    name = [name];
                }

                var promise;

                angular.forEach(name, function (strategyName, index) {
                    if (index === 0) {
                        promise = $q.when(connect.strategy(strategyName).login(options));
                    } else {
                        promise = promise.catch(function () {
                            return connect.strategy(strategyName).login(options);
                        });
                    }
                });

                return promise;
            },

            logout: function (name, options) {
                if (!angular.isArray(name)) {
                    name = [name];
                }

                var promise;

                angular.forEach(name, function (strategyName, index) {
                    if (index === 0) {
                        promise = $q.when(connect.strategy(strategyName).logout(options));
                    } else {
                        promise = promise.catch(function () {
                            return connect.strategy(strategyName).logout(options);
                        });
                    }
                });

                return promise;
            }
        };

    });})(window, window.angular, window.queryString);