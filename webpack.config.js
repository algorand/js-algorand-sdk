const path = require('path');

module.exports = {
    mode: 'production',
    entry: './index.js',
    output: {
        filename: 'algosdk.min.js',
        path: path.resolve(__dirname, 'dist'),
        library: {
            type: 'window',
            name: 'algosdk',
        },
    },
    devtool: 'source-map',
};
