/* eslint-disable import/no-extraneous-dependencies */

import webpack from 'webpack';
import path from 'path';

// noinspection WebpackConfigHighlighting
module.exports = new webpack.optimize.CommonsChunkPlugin(
  {
    name: 'common',
    filename: path.join('js', 'bundle-commons.js'),
  });
