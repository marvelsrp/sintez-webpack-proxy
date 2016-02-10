import ProxyMutator from './proxy-mutator';

module.exports = (key, config, advanced) => {
  return new ProxyMutator(key, config, advanced);
};