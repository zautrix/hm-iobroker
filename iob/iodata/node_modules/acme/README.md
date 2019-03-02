# [acme.js](https://git.coolaj86.com/coolaj86/acme.js)

Free SSL for everybody. The bare essentials of the Let's Encrypt v2 (ACME) API.
Built for [Greenlock](https://git.coolaj86.com/coolaj86/greenlock-express.js),
[by request](https://git.coolaj86.com/coolaj86/greenlock.js/issues/5#issuecomment-8).

| A [Root](https://therootcompany.com) Project |
!["Monthly Downloads"](https://img.shields.io/npm/dm/acme-v2.svg "Monthly Download Count can't be shown")
!["Weekly Downloads"](https://img.shields.io/npm/dw/acme-v2.svg "Weekly Download Count can't be shown")

# Looking for Quick 'n' Easy&trade;?

This is intented for building ACME API clients in node.js. It is **not** a high-level, fully-integrated solution.

You may be more interested in one of these:

* <https://greenlock.domains> Instant SSL Certificates in your Browser
* [Greenlock for Web Browsers](https://git.coolaj86.com/coolaj86/greenlock.html) (Browser JavaScript)
* [Greenlock for Web Servers](https://git.coolaj86.com/coolaj86/greenlock-cli.js) (Command line, like certbot)
* [Greenlock for Express.js](https://git.coolaj86.com/coolaj86/greenlock-express.js) (Automated HTTPS for Express.js apps)
* [Greenlock for node.js](https://git.coolaj86.com/coolaj86/greenlock.js) (Automated HTTPS for Proxies, Load-Balances, Servers, CLIs)
* [goldilocks.js](https://git.coolaj86.com/coolaj86/goldilocks.js) (A Full-Blown WebServer)

# Demonstration

As this is intended to *build* ACME clients, there is not a simple 2-line example.

I'd recommend first trying out one of the [greenlock-express.js](https://git.coolaj86.com/coolaj86/greenlock-express.js)
or [Greenlock for Web Servers](https://git.coolaj86.com/coolaj86/greenlock-cli.js) examples,
which are guaranteed to work and have great error checking to help you debug.

Then I'd recommend running the example CLI client with a test domain and then investigating the files used for that example:

```bash
git clone https://git.coolaj86.com/coolaj86/acme.js.git
pushd acme.js/
node examples/cli.js
```

The example cli has the following prompts:

```
What web address(es) would you like to get certificates for? (ex: example.com,*.example.com)
What challenge will you be testing today? http-01 or dns-01? [http-01]
What email should we use? (optional)
What directoryUrl should we use? [https://acme-staging-v02.api.letsencrypt.org/directory]

Put the string 'mBfh0SqaAV3MOK3B6cAhCbIReAyDuwuxlO1Sl70x6bM.VNAzCR4THe4czVzo9piNn73B1ZXRLaB2CESwJfKkvRM' into a file at 'example.com/.well-known/acme-challenge/mBfh0SqaAV3MOK3B6cAhCbIReAyDuwuxlO1Sl70x6bM'

echo 'mBfh0SqaAV3MOK3B6cAhCbIReAyDuwuxlO1Sl70x6bM.VNAzCR4THe4czVzo9piNn73B1ZXRLaB2CESwJfKkvRM' > 'example.com/.well-known/acme-challenge/mBfh0SqaAV3MOK3B6cAhCbIReAyDuwuxlO1Sl70x6bM'

Then hit the 'any' key to continue...
```

When you've completed the challenge you can hit a key to continue the process.

If you place the certificate you receive back in `tests/fullchain.pem`
then you can test it with `examples/https-server.js`.

```
examples/cli.js
examples/genkeypair.js
examples/https-server.js
examples/http-server.js
```

# Let's Encrypt v2 / ACME draft 11 Support

This library (acme.js) supports ACME [*draft 11*](https://tools.ietf.org/html/draft-ietf-acme-acme-11),
otherwise known as Let's Encrypt v2 (or v02).

  * ACME draft 11
  * Let's Encrypt v2
  * Let's Encrypt v02

```
# Production URL
https://acme-v02.api.letsencrypt.org/directory
```

```
# Staging URL
https://acme-staging-v02.api.letsencrypt.org/directory
```

# Install

Install via npm

```bash
npm install --save acme
```

Install via git

```bash
npm install https://git.coolaj86.com/coolaj86/acme.js.git
```

# API

This API is an evolution of le-acme-core,
but tries to provide a better mapping to the new draft 11 APIs.

Status: Almost stable, but **not semver locked**.

Patch versions will not introduce breaking changes,
but may introduce lower-level APIs.
Minor versions may change return values to include more information.

### Overview

```
var ACME = require('acme').ACME;

ACME.create(opts)

acme.init(acmeDirectoryUrl)
acme.accounts.create(opts)
acme.certificates.create(opts)
```

### Detailed Explanation

```
var ACME = require('acme').ACME;

// Create Instance (Dependency Injection)
var acme = ACME.create({
  RSA: require('rsa-compat').RSA

  // other overrides
, request: require('request')
, promisify: require('util').promisify

  // used for constructing user-agent
, os: require('os')
, process: require('process')

  // used for overriding the default user-agent
, userAgent: 'My custom UA String'
, getUserAgentString: function (deps) { return 'My custom UA String'; }

  // don't try to validate challenges locally
, skipChallengeTest: false
});


// Discover Directory URLs
acme.init(acmeDirectoryUrl)                   // returns Promise<acmeUrls={keyChange,meta,newAccount,newNonce,newOrder,revokeCert}>


// Accounts
acme.accounts.create(options)                 // returns Promise<regr> registration data

    { email: '<email>'                        //    valid email (server checks MX records)
    , accountKeypair: {                       //    privateKeyPem or privateKeyJwt
        privateKeyPem: '<ASCII PEM>'
      }
    , agreeToTerms: fn (tosUrl) {}            //    returns Promise with tosUrl
    }


// Registration
acme.certificates.create(options)             // returns Promise<pems={ privkey (key), cert, chain (ca) }>

    { newAuthzUrl: '<url>'                    //    specify acmeUrls.newAuthz
    , newCertUrl: '<url>'                     //    specify acmeUrls.newCert

    , domainKeypair: {
        privateKeyPem: '<ASCII PEM>'
      }
    , accountKeypair: {
        privateKeyPem: '<ASCII PEM>'
      }
    , domains: [ 'example.com' ]

    , setChallenge: fn (hostname, key, val)   // return Promise
    , removeChallenge: fn (hostname, key)     // return Promise
    }
```

Helpers & Stuff

```javascript
// Constants
ACME.challengePrefixes['http-01']             // '/.well-known/acme-challenge'
ACME.challengePrefixes['dns-01']              // '_acme-challenge'
```

# Changelog

* v1.0.9 - update docs
* v1.0.8 - rename to acme.js, remove backwards compat
* v1.0.7 - improved error handling again, after user testing
* v1.0.6 - improved error handling
* v1.0.5 - cleanup logging
* v1.0.4 - v6- compat use `promisify` from node's util or bluebird
* v1.0.3 - documentation cleanup
* v1.0.2
  * use `options.contact` to provide raw contact array
  * made `options.email` optional
  * file cleanup
* v1.0.1
  * Compat API is ready for use
  * Eliminate debug logging
* Apr 10, 2018 - tested backwards-compatibility using greenlock.js
* Apr  5, 2018 - export http and dns challenge tests
* Apr  5, 2018 - test http and dns challenges (success and failure)
* Apr  5, 2018 - test subdomains and its wildcard
* Apr  5, 2018 - test two subdomains
* Apr  5, 2018 - test wildcard
* Apr  5, 2018 - completely match api for acme v1 (le-acme-core.js)
* Mar 21, 2018 - *mostly* matches le-acme-core.js API
* Mar 21, 2018 - can now accept values (not hard coded)
* Mar 20, 2018 - SUCCESS - got a test certificate (hard-coded)
* Mar 20, 2018 - download certificate
* Mar 20, 2018 - poll for status
* Mar 20, 2018 - finalize order (submit csr)
* Mar 20, 2018 - generate domain keypair
* Mar 20, 2018 - respond to challenges
* Mar 16, 2018 - get challenges
* Mar 16, 2018 - new order
* Mar 15, 2018 - create account
* Mar 15, 2018 - generate account keypair
* Mar 15, 2018 - get nonce
* Mar 15, 2018 - get directory

# Legal

[acme.js](https://git.coolaj86.com/coolaj86/acme.js) |
MPL-2.0 |
[Terms of Use](https://therootcompany.com/legal/#terms) |
[Privacy Policy](https://therootcompany.com/legal/#privacy)
