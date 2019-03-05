le-store-certbot
================

The "certbot" storage strategy for
[Greenlock.js](https://git.coolaj86.com/coolaj86/le-store-certbot.js).

This le storage strategy aims to maintain compatibility with the
configuration files and file structure of the official certbot client.

Note: You cannot use this strategy on ephemeral instances (heroku, aws elastic).

Usage
-----

```bash
npm install --save le-store-certbot@2.x
```

```bash
var leStore = require('le-store-certbot').create({
  configDir: require('homedir')() + '/acme/etc'          // or /etc/acme or wherever
, privkeyPath: ':configDir/live/:hostname/privkey.pem'          //
, fullchainPath: ':configDir/live/:hostname/fullchain.pem'      // Note: both that :configDir and :hostname
, certPath: ':configDir/live/:hostname/cert.pem'                //       will be templated as expected by
, chainPath: ':configDir/live/:hostname/chain.pem'              //       greenlock.js

, logsDir: require('homedir')() + '/tmp/acme/log'

, webrootPath: '~/acme/srv/www/:hostname/.well-known/acme-challenge'

, debug: false
});
```

The store module can be used globally with Greenlock like this:

```
var Greenlock = require('greenlock');

Greenlock.create({
  ...
, store: leStore
});
```

Example File Structure
----------------------

```
~/acme/
└── etc
    ├── accounts
    │   └── acme-staging.api.letsencrypt.org
    │       └── directory
    │           └── cd96ac4889ddfa47bfc66300ab223342
    │               ├── meta.json
    │               ├── private_key.json
    │               └── regr.json
    ├── archive
    │   └── example.com
    │       ├── cert0.pem
    │       ├── chain0.pem
    │       ├── fullchain0.pem
    │       └── privkey0.pem
    ├── live
    │   └── example.com
    │       ├── cert.pem
    │       ├── chain.pem
    │       ├── fullchain.pem
    │       ├── privkey.pem
    │       └── privkey.pem.bak
    └── renewal
        ├── example.com.conf
        └── example.com.conf.bak
```
