/* eslint-disable import/no-extraneous-dependencies */

import gulp from 'gulp';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import gutil from 'gulp-util';
import path from 'path';
import runSequence from 'run-sequence';
import del from 'del';

import webpackConfig from './webpack.config.babel';
import pluginsWithoutUglify from './config/webpackPluginsWithoutUglify';
import webpackCommonsChunkPluginConfig from './config/webpackCommonsChunkPluginConfig';

const cache = {};

const config = {
  prod: false,
  addon: false,
  noEval: false,
};

webpackConfig.output.devtoolModuleFilenameTemplate = info =>
  `wp:///${path.relative(__dirname, info.resourcePath)}`;

webpackConfig.output.devtoolFallbackModuleFilenameTemplate = info =>
  `wp:///${path.relative(__dirname, info.resourcePath)}?${info.hash}`;

require('webpack/lib/ModuleFilenameHelpers').createFooter = () => '';

// pretend it's prod ( still has sourcemaps )
// slowest compilation
gulp.task('webpack-dev-server-prod', () => {
  config.prod = true;
  config.addon = true;

  runSequence('webpack-dev-server');
});

// no eval, faster runtime, slower compilation
gulp.task('webpack-dev-server-no-eval', () => {
  config.noEval = true;

  runSequence('webpack-dev-server');
});

// fast compilation, low runtime performance
gulp.task('webpack-dev-server', () => {
  const host = '0.0.0.0';
  const port = 8080;

  webpackConfig.cache = cache;

  webpackConfig.entry.app = [
    `webpack-dev-server/client?http://${host}:${port}`, // WebpackDevServer host and port
    'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
  ].concat(webpackConfig.entry.app);

  webpackConfig.entry.advanced = [
    `webpack-dev-server/client?http://${host}:${port}`, // WebpackDevServer host and port
    'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
  ].concat(webpackConfig.entry.advanced);

  webpackConfig.module.loaders.forEach((loader) => {
    if (loader.loader === 'babel-loader') {
      loader.query.plugins.push('react-hot-loader/babel');
    }
  });

  if (config.prod) {
    webpackConfig.devtool = 'source-map';
  } else if (config.noEval) {
    webpackConfig.devtool = 'cheap-module-source-map';
  } else {
    webpackConfig.devtool = 'eval-cheap-module-source-map';
  }

  webpackConfig.plugins = [
    new webpack.HotModuleReplacementPlugin(),
    webpackCommonsChunkPluginConfig,
  ];

  if (config.prod) {
    webpackConfig.plugins.unshift(
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"',
          ENABLE_REACT_ADDON_HOOKS: config.addon ? '"true"' : '"false"',
        },
      }));

    webpackConfig.plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
        },
        mangle: true,
      }));
  }

  // Start a webpack-dev-server
  const compiler = webpack(webpackConfig);

  new WebpackDevServer(compiler, webpackConfig.devServer).listen(port, host, (err) => {
    if (err) {
      throw new gutil.PluginError('webpack-dev-server', err);
    }

    // Server listening
    gutil.log('[webpack-dev-server]', 'http://localhost:8080/webpack-dev-server/index.html');

    // keep the server alive or continue?
    // callback();
  });
});

// only enable addon integration, everything else in prod settings
gulp.task('build-prod-with-addon', (callback) => {
  webpackConfig.plugins.unshift(new webpack.DefinePlugin({
    'process.env': {
      ENABLE_REACT_ADDON_HOOKS: '"true"',
    },
  }));

  runSequence('build', callback);
});

// also adds sourceMaps too!
gulp.task('build-prod-with-addon-no-mangle', (callback) => {
  webpackConfig.devtool = 'source-map';

  webpackConfig.plugins = pluginsWithoutUglify.concat([
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
      mangle: false,
    }),
  ]);

  runSequence('build-prod-with-addon', callback);
});

// build without production node env
gulp.task('build-dev', (callback) => {
  webpackConfig.plugins = [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
      mangle: true,
    }),
  ];

  runSequence('build', callback);
});

gulp.task('clean-pages', () => del('pages/**/!(.git|README.md)'));

gulp.task('copy-assets', () => gulp
  .src('assets/**/*')
  .pipe(gulp.dest('pages/')));

// just run webpack with default config (prod)
gulp.task('build', ['clean-pages'], (callback) => {
  webpack(webpackConfig, (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    }

    gutil.log('[webpack]', stats.toString({
      // output options
    }));

    runSequence('copy-assets', callback);
  });
});

gulp.task('default', ['webpack-dev-server']);
