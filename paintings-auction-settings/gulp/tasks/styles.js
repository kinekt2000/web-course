const plumber = require("gulp-plumber"),
    rename = require("gulp-rename"),
    less = require("gulp-less"),
    cleanCSS = require("gulp-clean-css")

module.exports = () => {
    $.gulp.task('styles:dev', () => {
        return $.gulp.src($.src + "styles/*.less")
            .pipe(plumber())
            .pipe(less())
            .pipe(plumber.stop())
            .pipe(rename({
                extname: ".css"
            }))
            .pipe($.gulp.dest($.dst + "styles/"))
    })

    $.gulp.task('styles:build', () => {
        return $.gulp.src($.src + "styles/*.less")
            .pipe(plumber())
            .pipe(less())
            .pipe(cleanCSS())
            .pipe(plumber.stop())
            .pipe(rename({
                extname: ".css"
            }))
            .pipe($.gulp.dest($.dst + "styles/"))
    })
}
