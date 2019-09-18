module.exports = function () {
  $.gulp.task('serve', function () {
    $.browserSync.init({
      server: './build',
      open: true,
      // online: false, // Work Offline Without Internet Connection
      tunnel: true,
      tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
    });
  });
};