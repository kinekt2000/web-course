const plumber = require("gulp-plumber"),
    babel = require("gulp-babel"),
    uglify =  require("gulp-uglify")

module.exports = () => {
    $.gulp.task('scripts:dev', () => {
        return $.gulp.src($.src + "/scripts/*.js")
            .pipe(plumber())
            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(plumber.stop())
            .pipe($.gulp.dest($.dst + "/scripts/"))
    })

    $.gulp.task('scripts:build', () => {
        return $.gulp.src($.src + "/scripts/*.js")
            .pipe(plumber())
            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(uglify())
            .pipe(plumber.stop())
            .pipe($.gulp.dest($.dst + "/scripts/"))
    })

    $.gulp.task('libJS:dev', () => {
        return $.gulp.src(['node_modules/jquery/dist/jquery.js'])
            .pipe($.gulp.dest($.dst + "scripts/extLib/"))
    })
}