const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const icons = require('./src/icons');
const { TRANSITION_DURATION, BREAKPOINTS } = require('./src/constants');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  watch: !isProduction,
  entry: {
    main: './src/main.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              additionalData: `
                $webpack-breakpoints-sm: ${BREAKPOINTS.sm}rem;
                $webpack-transition-duration: ${TRANSITION_DURATION}s;
              `,
            },
          },
        ],
      },
      {
        test: /\.png$/,
        type: 'asset/inline',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: false,
      templateParameters: {
        icons,
      },
    }),
    new MiniCssExtractPlugin(),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: { drop_console: true },
        },
      }),
    ],
  },
};
