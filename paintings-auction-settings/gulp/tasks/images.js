const imagemin = require("gulp-imagemin"),
    imageminJpegRecompress = require("imagemin-jpeg-recompress"),
    pngquant = require("imagemin-pngquant"),
    cache = require("gulp-cache"),
    rename = require("gulp-rename"),
    fs = require("fs");

module.exports = () => {
    $.gulp.task('images', () => {
        const paintingsData = fs.readFileSync("./db/paintings.json", "utf8");
        const paintings = JSON.parse(paintingsData);

        function identifyImage(name) {
            for(const painting of paintings) {
                if(name === painting.name) {
                    return painting.id;
                }
            }
            return `unknown${Date.now()}`;
        }

        return $.gulp.src($.src + "images/*.{png,jpg,svg}")
            .pipe(cache(imagemin([
                imagemin.mozjpeg({quality: 100, progressive: true}),
                imageminJpegRecompress({
                    loops: 5,
                    min: 80,
                    max: 90,
                    quality: "medium"
                }),
                imagemin.svgo(),
                imagemin.optipng({optimizationLevel: 3}),
                pngquant({quality: [.65, .70], speed: 5})
            ], {
                verbose: true
            })))
            .pipe(rename((path) => {
                const newName = identifyImage(path.basename);
                return{
                    dirname: path.dirname,
                    basename: newName,
                    extname: path.extname
                };
            }))
            .pipe($.gulp.dest($.dst + `images/`));
    })
}
