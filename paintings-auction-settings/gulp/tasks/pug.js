const plumber = require("gulp-plumber"),
    pug = require("gulp-pug"),
    cached = require("gulp-cached");

module.exports = () => {
    $.gulp.task('pug', () => {
        return $.gulp.src($.src + 'pug/*.pug')
            .pipe(plumber())
            .pipe(pug({
                pretty: true
            }))
            .pipe(plumber.stop())
            .pipe(cached('pug'))
            .pipe($.gulp.dest($.dst + "html/"))
    })
}