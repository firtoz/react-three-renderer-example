/* eslint-disable import/no-extraneous-dependencies */

import webpack from 'webpack';

import commonsChunkPluginConfig from './webpackCommonsChunkPluginConfig';

// noinspection WebpackConfigHighlighting
module.exports = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: '"production"',
    },
  }),
  commonsChunkPluginConfig,
];
