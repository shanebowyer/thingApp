var gulp = require('gulp'),
  connect = require('gulp-connect');

gulp.task('connect', function() {
  connect.server({
    root: 'app',
    livereload: true,
    port: 8080
  });
});

gulp.task('html', function () {
  gulp.src('./app/*.html')
    .pipe(connect.reload());
});

gulp.task('appjs', function () {
  gulp.src('./app/*.js')
    .pipe(connect.reload());
});


gulp.task('components', function () {
  gulp.src('./app/components/home/*.html')
    .pipe(connect.reload());
});

gulp.task('componentsSettings', function () {
  gulp.src('./app/components/settings/*.html')
    .pipe(connect.reload());
});

gulp.task('componentsjs', function () {
  gulp.src('./app/components/home/*.js')
    .pipe(connect.reload());
});


gulp.task('assets', function () {
  gulp.src('./app/assets/js/*.js')
    .pipe(connect.reload());
});

gulp.task('services', function () {
  gulp.src('./app/services/*.js')
    .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch(['./app/*.html', './app/*.js', './app/components/home/*.html', './app/components/settings/*.html', './app/components/home/*.js', './app/services/*.js'],
        ['html', 'appjs', 'components', 'componentsSettings', 'componentsjs', 'services']);
});

gulp.task('default', ['connect', 'watch']);

