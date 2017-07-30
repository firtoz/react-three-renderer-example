/* eslint-disable import/no-extraneous-dependencies */

import path from 'path';
import webpack from 'webpack';
import pluginsWithoutUglify from './config/webpackPluginsWithoutUglify';

import packageJson from './package.json';

const outPath = path.join(__dirname, 'pages');

const plugins = pluginsWithoutUglify.concat([
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
    },
    mangle: true,
  }),
]);

const babelLoaderConfigShared = {
  test: /\.jsx?$/,
  loader: 'babel-loader',
  query: {
    ...packageJson.babel,
    cacheDirectory: true,
  },
};

export default {
  entry: {
    app: [
      './src/index.jsx',
    ],
    advanced: [
      './src/examples/AdvancedExample/index.js',
    ],
  },
  output: {
    path: outPath,
    filename: path.join('js', 'bundle-[name].js'),
  },
  module: {
    loaders: [
      {
        loader: 'json-loader',
        test: /\.json$/,
      },
      {
        exclude: /node_modules/,
        ...babelLoaderConfigShared,
      },
      {
        include: /react-three-renderer[\\/]src/,
        ...babelLoaderConfigShared,
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      // use the source files
      'react-three-renderer': path.join(
        __dirname, 'node_modules', 'react-three-renderer', 'src'),
    },
  },
  devServer: {
    contentBase: path.join(__dirname, 'assets'),
    // noInfo: true, //  --no-info option
    hot: true,
    inline: true,
    stats: { colors: true },
  },
  plugins,
};
