const path = require('path');

module.exports = {
  entry: './js/combolyzer.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  }
};
