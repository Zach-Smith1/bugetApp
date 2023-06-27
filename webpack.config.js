const webpack = require('webpack');
const path = require('path');

const config = {
  entry: './src/index.js',
  devtool: "eval-cheap-source-map",
  resolve: {
    fallback: {
    "fs": false,
    "tls": false,
    "net": false,
    "path": false,
    "zlib": false,
    "http": false,
    "https": false,
    "stream": require.resolve('stream-browserify'),
    "buffer": require.resolve("buffer/"),
    "crypto": false,
    "url": false,
    "util": require.resolve("util/"),
    "querystring": require.resolve("querystring-es3"),
    "assert": false
    }
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  }
};

module.exports = config;