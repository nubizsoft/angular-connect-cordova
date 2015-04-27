/**
 * undefined
 * @version v0.0.1
 * @link undefined
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */(function(){
angular.module('angular-connect-cordova', ['angular-connect', 'ngCordova.plugins.oauth']);
angular.module('angular-connect-cordova')
    .factory('cordovaStrategy', function ($q, $cordovaOauth, connect, connectStrategy) {

        var cordovaStrategy = function (options, verify) {

            this.name = 'cordova';
            connectStrategy.apply(this, [options, verify]);
        };

        cordovaStrategy.prototype = new connectStrategy();

        cordovaStrategy.prototype.login = function login(params, options) {
            var self = this;

            return $q.when().then(function () {
                var promise = $cordovaOauth[self.options.provider].apply(this, self.options.params);

                if (self.verify) {
                    promise = promise.then(self.verify);
                }
                return promise;
            });
        };

        return cordovaStrategy;

    });
})();