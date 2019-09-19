module.exports = function () {
  $.gulp.task('fonts', () => {
    return $.gulp.src('./dev/fonts/**/*.*')
      .pipe($.gulp.dest('./build/fonts/'));
  });
};