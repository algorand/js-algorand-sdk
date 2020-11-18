const path = require('path');

module.exports = {
    entry: './test.js',
    output: {
        filename: 'test.js',
        path: path.resolve(__dirname, 'build'),
    },
    devtool: "source-map",
};
