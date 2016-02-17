import BaseEvents from 'base-events';
import memoryCache from 'memory-cache-stream';
import requestProxy from 'express-request-proxy';
import urljoin from 'url-join';

const DEFAULT_CACHE_MAX_AGE = 3600;

const normalize = (value) => {
  let result = [];

  if (Array.isArray(value))  {
    result = value;
  } else {
    result.push(value);
  }

  return result;
};

class ProxyMutator extends BaseEvents {
  constructor(key, config, advanced) {
    super();
    if (!config){
      return false;
    }

    this.normalized = Object.assign({}, config, {
      basePath: config.basePath || '',
      ignorePaths: normalize(config.ignorePaths),
      flushPaths: normalize(config.flushPaths),
      cacheMaxAge:  config.cacheMaxAge || DEFAULT_CACHE_MAX_AGE
    });

    this.normalized.APIUrl = urljoin(config.protocol + '://' + config.host, this.normalized.basePath + '/*')

    console.log(this.normalized);

    this.webpack = config.webpack;
    this.server = config.webpack.getServer();
    this.memory = memoryCache();

    this.server.app.use( (req, res, next) => {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.header('Access-Control-Allow-Credentials', true);
      res.header('Access-Control-Allow-Methods', '*');
      res.header('Access-Control-Allow-Headers', '*');

      next();
    });


    this.server.app.all(this.normalized.basePath + '/*', (req, res) => {

      let params = {
        url: this.normalized.APIUrl,
        timeout: 1800000,
        headers: (req.headers) ? {Cookie: req.headers.cookie} : null
      };

      let isIgnore = this.isIgnore(req.path);
      let isFlush = this.isFlush(req.path);
      let isGETMethod = req.method === 'GET';

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
          params.cacheMaxAge = this.normalized.cacheMaxAge;
          break;
        default:
          this.emit('pass', {req: req, res: res});
          break;
      }

      return requestProxy(params)(req, res);
    });

  }



  isIgnore(findPath) {
    return this.normalized.ignorePaths
      .some(path => urljoin(this.normalized.basePath,  path) === findPath);
  }

  isFlush(findPath) {
    return this.normalized.flushPaths
      .some(path => urljoin(this.normalized.basePath,  path) === findPath);
  }

  serve(callback) {
    this.webpack.serve(callback, this.server);
  }
}

export default ProxyMutator;