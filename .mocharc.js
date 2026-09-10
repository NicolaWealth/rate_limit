module.exports = {
  require: ['ts-node/register'],
  reporter: 'xunit',
  'reporter-option': ['output=test-results.xml'],
  'full-trace': true,
  color: true,
  bail: true,
  spec: 'src/**/*.test.ts'
};
