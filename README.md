# Intelligent http proxy middleware for Sintez

High performance streaming http request reverse proxy for [Sintez](https://github.com/frankland/sintez).

#Environment **dev-proxy.yml**:
``` yml
include:
  - %base_config%.yml

api:
  protocol: %protocol%
  host: %host%:%port%

bo-proxy-server:
  protocol:  %protocol%
  host: %host%:%port%
  base-path: /%base-path%
  ignore-path:
    - /%ignore-path%
  flush-path:
    - /%flush-path%
  webpack: webpack ~ webpack
```


In Sintez server run:
`gulp dev-proxy --conf=env/dev-proxy`