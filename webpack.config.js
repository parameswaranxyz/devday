var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: [
    './src/app.ts',
    './css/home.scss',
    './css/archive.scss',
    './css/event.scss'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'app.js',
    publicPath: '/dist/'
  },
  debug: true,
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    // new webpack.optimize.UglifyJsPlugin()
  ],
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts' },
      { test: /\.scss$/, loaders: [ 'style', 'css', 'sass'] }
    ]
  },
  sassLoader: {
    includePaths: [path.resolve(__dirname, "./_sass")]
  }
};
