var webpack = require('webpack');  
module.exports = {  
  entry: './src/app.ts',
  output: {
    filename: './_js/app.js'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ],
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts' }
    ]
  }
}