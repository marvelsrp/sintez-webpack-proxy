import BaseEvents from 'base-events';
import memoryCache from 'memory-cache-stream';
import requestProxy from 'express-request-proxy';
import _ from 'lodash';
import urljoin from 'url-join';

export default class ProxyMutator extends BaseEvents {
  constructor(key, config, advanced) {
    super();
    this.config = config;

    this.config['ignore-path'] = this.normalize(this.config['ignore-path']);
    this.config['flush-path'] = this.normalize(this.config['flush-path']);

    this.webpack = config.webpack;
    this.server = config.webpack.getServer();
    this.memory = memoryCache();
    this.path = config['base-path'] + '/*';
    this.url = urljoin(config.protocol + '://' + config.host, this.path);
    this.server.app.use( (req, res, next) => {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.header('Access-Control-Allow-Credentials', true);
      res.header('Access-Control-Allow-Methods', '*');
      res.header('Access-Control-Allow-Headers', '*');

      next();
    });


    this.server.app.all(this.path, (req, res) => {

      var params = {
        url: this.url,
        timeout: 1800000,
        headers: (req.headers) ? {Cookie: req.headers.cookie} : null
      };

      var isIgnore = this.isIgnore(req.path);
      var isFlush = this.isFlush(req.path);
      var isGETMethod = req.method === 'GET';

      switch ( true ){
        case isIgnore:
          this.emit('ignore', {req: req, res: res});
          break;
        case isFlush:
          this.emit('flush', {req: req, res: res});
          this.memory.flushall();
          break;
        case isGETMethod:
          this.emit('proxy', {req: req, res: res});
          params.cache = this.memory;
          params.cacheMaxAge = 3600;
          break;
        default:
          this.emit('pass', {req: req, res: res});
          break;
      }

      return requestProxy(params)(req, res);
    });

  }

  normalize(value) {
    var result = value;
    if (value && !Array.isArray(value))  {
      result = [ value ];
    }
    return result;
  }

  isIgnore(findPath) {
    return this.config['ignore-path']
      .some(path => urljoin(this.config['base-path'],  path) === findPath);
  }

  isFlush(findPath) {
    return this.config['flush-path']
      .some(path => urljoin(this.config['base-path'],  path) === findPath);
  }

  serve(callback) {
    this.webpack.serve(callback, this.server);
  }
}
