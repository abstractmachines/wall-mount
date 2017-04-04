const webpack = require('webpack')
const path = require('path')
const htmlWebpackPlugin = require('html-webpack-plugin')

// just so we have some static-ish resolution
require('babel-loader')

module.exports = {
  entry: './client/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'client.js',
    // publicPath: j
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve('client'),
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['es2015'],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new htmlWebpackPlugin(),
  ],
  devServer: {
    port: 3100,
    contentBase: path.resolve(__dirname, 'dist'),
    proxy: {
      '/api': 'http://localhost:3101',
    }
  },
}
