/**
 * undefined
 * @version v0.0.1
 * @link undefined
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */(function(){
angular.module('angular-connect-cordova', ['angular-connect', 'ngCordova.plugins.oauth']);
angular.module('angular-connect-cordova')
    .factory('cordovaStrategy', function ($q, $cordovaOauth, connect, connectStrategy) {

        var cordovaStrategy = function (options) {

            this.name = 'cordova';
            connectStrategy.call(this, options);
        };

        cordovaStrategy.prototype = new connectStrategy();

        cordovaStrategy.prototype.login = function login(params, options) {
            var self = this;

            return $cordovaOauth[self.options.provider].apply(this, self.options.params).catch(function (error){
                console.log(error);
            });

            return $q.reject({});
        };

        return cordovaStrategy;

    });
})();