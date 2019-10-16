const presets = ['@babel/env'];
const env = {
  test: {
    plugins: ['istanbul'],
  },
};

module.exports = {
  presets,
  env,
};
