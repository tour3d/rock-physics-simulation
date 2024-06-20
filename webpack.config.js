const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'static'),
          to: path.resolve(__dirname, 'dist/static'),
        },
        {
          from: path.resolve(__dirname, 'assets/web-server.exe'),
          to: path.resolve(__dirname, 'dist/web-server.exe'),
        },
      ],
    }),
  ],
  resolve: {
    fallback: {
      fs: false,
      path: require.resolve('path-browserify'),
    },
  },
  devServer: {
    static: [
      {
        directory: path.join(__dirname, 'static'),
        publicPath: '/static',
      },
    ],
    compress: true,
    port: 9000,
  },
  performance: {
    hints: false, // Отключаем предупреждения о производительности
  },
};
