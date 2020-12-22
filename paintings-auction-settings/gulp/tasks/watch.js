module.exports = function () {
    $.gulp.task('watch', function () {
        $.gulp.watch($.src + 'pug/**/*.pug', $.gulp.series('pug'));
        $.gulp.watch($.src + 'styles/*.less', $.gulp.series('styles:dev'));
        $.gulp.watch($.src + 'scripts/*.js', $.gulp.series('scripts:dev'));
    });
};