const path = require("path")

module.exports = {
    mode: "development",
    entry: {
        admin: './src/admin.js',
        common: './src/common.js',
        dash: './src/dash.js',
        waiting: './src/waiting.js'
    },
    devtool: "source-map",
    output: {
        path: path.resolve(__dirname, "public"),
        filename: './scripts/[name].js',
    }
}