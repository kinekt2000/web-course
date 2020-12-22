module.exports = () => {
    $.gulp.task('clean', () => {
        return $.del($.dst);
    })
}