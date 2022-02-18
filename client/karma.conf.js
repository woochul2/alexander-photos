module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    browsers: ['Chrome'],
    files: ['test/**/*.spec.js'],
    preprocessors: { 'test/**/*.spec.js': ['webpack'] },
    singleRun: true,
    webpack: {
      module: {
        rules: [
          {
            test: /\.png$/,
            type: 'asset/inline',
          },
        ],
      },
    },
  });
};
