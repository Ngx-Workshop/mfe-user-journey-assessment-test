const config = require('./webpack.config');
// Angular 21's internal chunks cross federation boundaries; keep module identities
// intact so production scope hoisting cannot create circular partial exports.
module.exports = {
  ...config,
  optimization: { ...config.optimization, concatenateModules: false },
};
