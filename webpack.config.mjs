// import path from 'path';

// webpack.config.js
export default {
  entry: './src/index.js',  // Update with your entry file
  experiments: {
    outputModule: true
  },
  output: {
    filename: 'index.js',  // Specify the output file name
    // path: path.resolve(__dirname, 'dist'),
    // library: 'MosquitoDbClient',
    libraryTarget: 'module', // or 'commonjs' or other target
  },
  mode: 'production',
  resolve: {
    extensions: ['.js', '.mjs'],
  },
  module: {
    rules: [{
      test: /\.(js)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader'
      },
      resolve: {
        fullySpecified: false,
      }
    }],
  },
};
