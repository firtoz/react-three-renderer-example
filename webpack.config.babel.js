import path from 'path';
import webpack from 'webpack';

const outPath = path.join(__dirname, 'pages');

const pluginsWithoutUglify = [
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': '"production"',
    },
  }),
  new webpack.optimize.CommonsChunkPlugin(path.join('js', 'bundle-commons.js'), ['app', 'advanced']),
];

const plugins = pluginsWithoutUglify.concat([
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
    },
    mangle: true,
  }),
]);

export default {
  entry: {
    app: [
      './src/index.js',
    ],
    advanced: [
      './src/examples/AdvancedExample/index.js',
    ],
  },
  output: {
    path: outPath,
    filename: path.join('js', 'bundle-[name].js'),
  },
  'module': {
    'loaders': [
      {
        loader: 'json-loader',
        test: /\.json$/,
      },
      {
        exclude: /(node_modules|bower_components)/,
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          optional: ['runtime'],
          cacheDirectory: true,
          stage: 0,
        },
      },
    ],
    'resolve': {
      'extensions': ['', '.js', '.jsx'],
    },
  },
  devServer: {
    contentBase: path.join(__dirname, 'assets'),
    // noInfo: true, //  --no-info option
    hot: true,
    inline: true,
    stats: {colors: true},
  },
  pluginsWithoutUglify,
  plugins,
};
