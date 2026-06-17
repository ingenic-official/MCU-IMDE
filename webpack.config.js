const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  // ---- Extension (Node target) ----
  const extensionConfig = {
    entry: {
      extension: path.resolve(__dirname, 'src', 'extension.ts'),
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      libraryTarget: 'commonjs2',
      devtoolModuleFilenameTemplate: '../[resource-path]',
      clean: {
        keep: /views\//,
      },
    },
    devtool: isProduction ? false : 'source-map',
    target: 'node',
    node: {
      __dirname: false,
      __filename: true,
    },
    externals: {
      'vscode': 'commonjs vscode',
    },
    optimization: {
      minimize: isProduction,
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                compilerOptions: {
                  module: 'es6',
                },
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.ts'],
    },
  };

  // ---- WebView (Browser target, Vue SFC) ----
  const webViewConfig = {
    entry: {
      webview: path.resolve(__dirname, 'src', 'views', 'webview', 'main.ts'),
    },
    output: {
      path: path.resolve(__dirname, 'dist', 'views'),
      filename: '[name]-bundle.js',
    },
    devtool: isProduction ? false : 'source-map',
    optimization: {
      minimize: isProduction,
    },
    performance: {
      hints: false,
      maxEntrypointSize: 1024 * 1024,
      maxAssetSize: 1024 * 1024,
    },
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            { loader: 'vue-style-loader' },
            { loader: 'css-loader' },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
                api: 'legacy',
                sassOptions: {
                  silenceDeprecations: ['legacy-js-api', 'import'],
                  includePaths: [path.resolve(__dirname, 'node_modules')],
                  quietDeps: true,
                },
              },
            },
          ],
        },
        {
          test: /\.vue$/,
          use: 'vue-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['vue-style-loader', 'css-loader'],
        },
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
            },
          },
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      conditionNames: ['import'],
      extensions: ['.ts', '.js', '.vue', '.json'],
      alias: {
        Vue: 'vue/dist/vue.esm-bundler.js',
      },
      fallback: {
        os: require.resolve('os-browserify/browser'),
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert/'),
      },
    },
    plugins: [
      new VueLoaderPlugin(),
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: false,
        __VUE_PROD_DEVTOOLS__: false,
      }),
    ],
  };

  return [extensionConfig, webViewConfig];
};
