'use strict';

var _proxyMutator = require('./proxy-mutator');

var _proxyMutator2 = _interopRequireDefault(_proxyMutator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (key, config, advanced) {
  return new _proxyMutator2.default(key, config, advanced);
};