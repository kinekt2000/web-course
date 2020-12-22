"use strict";

global.$ = {
    path: {
        task: require("./gulp/path/tasks.js")
    },

    src: "./dev/",
    dst: "./build/",

    gulp: require("gulp4"),
    del: require("del")
}

$.path.task.forEach((taskPath) => {
    require(taskPath)();
})

$.gulp.task('dev', $.gulp.series(
    'clean',
    $.gulp.parallel(
        'images',
        'pug',
        'styles:dev',
        'scripts:dev',
        'libJS:dev'
    )
))

$.gulp.task("build", $.gulp.series(
    "clean",
    $.gulp.parallel(
        "images",
        "pug",
        "styles:build",
        "scripts:build",
        "libJS:dev"
    )
))

$.gulp.task('default', $.gulp.series(
    'dev',
    'watch'
))