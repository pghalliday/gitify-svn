module.exports = {
  'extends': '@istanbuljs/nyc-config-babel',
  'all': true,
  'include': [
    'src/**/*.js',
  ],
  'check-coverage': false,
  'lines': 100,
  'statements': 100,
  'functions': 100,
  'branches': 100,
  'watermarks': {
    'lines': [100, 100],
    'statements': [100, 100],
    'functions': [100, 100],
    'branches': [100, 100],
  },
  'reporter': [
    'lcov',
  ],
};
