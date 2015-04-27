var gulp = require('gulp'),
  buildConfig = require('./config/build.config'),
  concat = require('gulp-concat'),
  argv = require('minimist')(process.argv.slice(2)),
  footer = require('gulp-footer'),
  header = require('gulp-header'),
  jshint = require('gulp-jshint'),
  uglify = require('gulp-uglify'),
  karma = require('karma').server,
  karmaConf = require('./config/karma.conf.js'),
  rename = require('gulp-rename'),
  shell = require('gulp-shell'),
  prettify = require('gulp-prettify');

gulp.task('default', ['build']);

gulp.task('build', function () {

  return gulp.src(buildConfig.files)
    .pipe(concat('angular-connect-cordova.js'))
    .pipe(header(buildConfig.closureStart))
    .pipe(footer(buildConfig.closureEnd))
    .pipe(header(buildConfig.banner))
    .pipe(gulp.dest(buildConfig.dist))
    .pipe(gulp.dest(buildConfig.demo['angular-connect-cordova']))
    .pipe(uglify())
    .pipe(header(buildConfig.banner))
    .pipe(rename({extname: '.min.js'}))
    .pipe(gulp.dest(buildConfig.dist))
    .pipe(gulp.dest(buildConfig.demo['angular-connect-cordova']));
});

gulp.task('karma', function (done) {
  karmaConf.singleRun = true;
  argv.browsers && (karmaConf.browsers = argv.browsers.trim().split(','));
  argv.reporters && (karmaConf.reporters = argv.reporters.trim().split(','));
  karma.start(karmaConf, done);
});

gulp.task('lint', function () {
  return gulp.src('./src/plugins/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('karma-watch', function (done) {
  console.log(karmaConf);
  karmaConf.singleRun = false;
  karma.start(karmaConf, done);
});

gulp.task('watch', ['build'], function () {
  gulp.watch(['src/**/*.js', 'test/**/*.js'], ['build']);
});


gulp.task('run-demo', ['watch'], shell.task([
  'cd demo &&  ionic run ios -l -c'
]));
