var webpack = require('webpack');

module.exports = {
  entry: './src/app.ts',
  output: {
    filename: './dist/app.js'
  },
  debug: true,
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },
  plugins: [
    // new webpack.NoErrorsPlugin(),
    // new webpack.optimize.UglifyJsPlugin()
  ],
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts' }
    ]
  }
};
