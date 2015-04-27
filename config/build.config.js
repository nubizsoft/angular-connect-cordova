var fs = require('fs');
var pkg = require('../package.json');

module.exports = {
    banner: '/**\n' +
    ' * ' + pkg.description + '\n' +
    ' * @version v' + pkg.version + '\n' +
    ' * @link ' + pkg.homepage + '\n' +
    ' * @license MIT License, http://www.opensource.org/licenses/MIT\n' +
    ' */',

    closureStart: '(function(){\n',
    closureEnd: '\n})();',

    dist: 'dist',
    demo: {
        'angular-connect-cordova': 'demo/www/lib/angular-connect-cordova/dist',
        lib: 'demo/www/lib',
        www: 'demo/www'
    },

    files: [
        'src/module.js',
        'src/strategy.js'
    ],

    versionData: {
        version: pkg.version
    }
};
