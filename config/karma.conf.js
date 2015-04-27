var buildConfig = require('./build.config.js');

module.exports = {
    files: [
        // Include jQuery only for testing convience (lots of DOM checking for unit tests on directives)
        'bower_components/angular/angular.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'bower_components/jquery/dist/jquery.js',
        'bower_components/angular-route/angular-route.js',
        'bower_components/angular-cookies/angular-cookies.js',
        'bower_components/angular-connect/dist/angular-connect.js',
        'bower_components/ngCordova/dist/ng-cordova.min.js',
        'bower_components/ngCordova/dist/ng-cordova-mocks.min.js',
    ]
        .concat(buildConfig.files)
        .concat('test/*.js')
    ,

    frameworks: ['jasmine'],
    reporters: ['progress', 'coverage'],
    preprocessors: {
        'src/*.js': ['coverage']
    },

    coverageReporter: {
        type: 'html',
        dir: 'coverage/'
    },

    port: 9876,
    colors: true,
    // possible values: 'OFF', 'ERROR', 'WARN', 'INFO', 'DEBUG'
    logLevel: 'INFO',
    autoWatch: true,
    captureTimeout: 60000,
    singleRun: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['Chrome']
};

