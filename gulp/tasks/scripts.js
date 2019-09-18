let uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    scriptsPATH = {
        //"inputVendor": "./dev/js/vendor/",
        //"inputMain": "./dev/js/main/",
        "input": "./dev/js/",
        "ouput": "./build/js/"
    };

module.exports = function () {
    $.gulp.task('libsJS:dev', () => {
        return $.gulp.src([
                'node_modules/jquery/dist/jquery.min.js',
                'node_modules/svg4everybody/dist/svg4everybody.min.js',
                'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
                //'node_modules/lazyload/lazyload.min.js',
                //'node_modules/moment/min/moment.min.js',
                //'node_modules/moment-range/dist/moment-range.js',
                'node_modules/slick-carousel/slick/slick.min.js',
                'node_modules/fotorama/fotorama.js',
                //'node_modules/daterangepicker/daterangepicker.js',
                'node_modules/bootstrap-select/js/bootstrap-select.js',
            ])
            .pipe(concat('libs.min.js'))
            .pipe($.gulp.dest(scriptsPATH.ouput));
    });

    $.gulp.task('libsJS:build', () => {
        return $.gulp.src([
                'node_modules/jquery/dist/jquery.min.js',
                'node_modules/svg4everybody/dist/svg4everybody.min.js',
                'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
                //'node_modules/lazyload/lazyload.min.js',
                //'node_modules/moment/min/moment.min.js',
                //'node_modules/moment-range/dist/moment-range.js',
                'node_modules/slick-carousel/slick/slick.min.js',
                'node_modules/fotorama/fotorama.js',
                //'node_modules/daterangepicker/daterangepicker.js',
                'node_modules/bootstrap-select/js/bootstrap-select.js',
            ])
            .pipe(concat('libs.min.js'))
            .pipe(uglify())
            .pipe($.gulp.dest(scriptsPATH.ouput));
    });

    $.gulp.task('js:dev', () => {
        return $.gulp.src([scriptsPATH.input + '*.js',
            '!' + scriptsPATH.input + 'libs.min.js'])
            .pipe($.gulp.dest(scriptsPATH.ouput))
            .pipe($.browserSync.reload({
                stream: true
            }));
    });

    /*$.gulp.task('js:build', () => {
        return $.gulp.src([scriptsPATH.input + '*.js',
            '!' + scriptsPATH.input + 'libs.min.js'])
            .pipe($.gulp.dest(scriptsPATH.ouput))
    });*/

    $.gulp.task('js:build-min', () => {
        return $.gulp.src([scriptsPATH.input + '*.js',
            '!' + scriptsPATH.input + 'libs.min.js'])
            .pipe(concat('main.min.js'))
            .pipe(uglify())
            .pipe($.gulp.dest(scriptsPATH.ouput))
    });
};
