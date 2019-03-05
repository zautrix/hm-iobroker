| **acme-v2.js** ([npm](https://www.npmjs.com/package/acme-v2))
| [acme-v2-cli.js](https://git.coolaj86.com/coolaj86/acme-v2-cli.js)
| [greenlock.js](https://git.coolaj86.com/coolaj86/greenlock.js)
| [goldilocks.js](https://git.coolaj86.com/coolaj86/goldilocks.js)
|

| A [Root](https://therootcompany.com) Project

# [acme-v2.js](https://git.coolaj86.com/coolaj86/acme-v2.js)

A lightweight, **Low Dependency**&#42; framework for building
Let's Encrypt v2 (ACME draft 12) clients, successor to `le-acme-core.js`.
Built [by request](https://git.coolaj86.com/coolaj86/greenlock.js/issues/5#issuecomment-8).

&#42; <small>although `node-forge` and `ursa` are included as `optionalDependencies`
for backwards compatibility with older versions of node, there are no other
dependencies except those that I wrote for this (and related) projects.</small>

## Looking for Quick 'n' Easy&trade;?

If you're looking to *build a webserver*, try [greenlock.js](https://git.coolaj86.com/coolaj86/greenlock.js).
If you're looking for an *ACME-enabled webserver*, try [goldilocks.js](https://git.coolaj86.com/coolaj86/goldilocks.js).

* [greenlock.js](https://git.coolaj86.com/coolaj86/greenlock.js)
* [goldilocks.js](https://git.coolaj86.com/coolaj86/goldilocks.js)

## How to build ACME clients

As this is intended to build ACME clients, there is not a simple 2-line example
(and if you want that, see [greenlock-express.js](https://git.coolaj86.com/coolaj86/greenlock-express.js)).

I'd recommend first running the example CLI client with a test domain and then investigating the files used for that example:

```bash
node examples/cli.js
```

The example cli has the following prompts:

```
What web address(es) would you like to get certificates for? (ex: example.com,*.example.com)
What challenge will you be testing today? http-01 or dns-01? [http-01]
What email should we use? (optional)
What API style would you like to test? v1-compat or promise? [v1-compat]

Put the string 'mBfh0SqaAV3MOK3B6cAhCbIReAyDuwuxlO1Sl70x6bM.VNAzCR4THe4czVzo9piNn73B1ZXRLaB2CESwJfKkvRM' into a file at 'example.com/.well-known/acme-challenge/mBfh0SqaAV3MOK3B6cAhCbIReAyDuwuxlO1Sl70x6bM'

echo 'mBfh0SqaAV3MOK3B6cAhCbIReAyDuwuxlO1Sl70x6bM.VNAzCR4THe4czVzo9piNn73B1ZXRLaB2CESwJfKkvRM' > 'example.com/.well-known/acme-challenge/mBfh0SqaAV3MOK3B6cAhCbIReAyDuwuxlO1Sl70x6bM'

Then hit the 'any' key to continue...
```

When you've completed the challenge you can hit a key to continue the process.

If you place the certificate you receive back in `tests/fullchain.pem`
you can then test it with `examples/https-server.js`.

```
examples/cli.js
examples/genkeypair.js
tests/compat.js
examples/https-server.js
examples/http-server.js
```

## Let's Encrypt Directory URLs

```
# Production URL
https://acme-v02.api.letsencrypt.org/directory
```

```
# Staging URL
https://acme-staging-v02.api.letsencrypt.org/directory
```

## Two API versions, Two Implementations

This library (acme-v2.js) supports ACME [*draft 11*](https://tools.ietf.org/html/draft-ietf-acme-acme-11),
otherwise known as Let's Encrypt v2 (or v02).

  * ACME draft 11
  * Let's Encrypt v2
  * Let's Encrypt v02

The predecessor (le-acme-core) supports Let's Encrypt v1 (or v01), which was a
[hodge-podge of various drafts](https://github.com/letsencrypt/boulder/blob/master/docs/acme-divergences.md)
of the ACME spec early on.

  * ACME early draft
  * Let's Encrypt v1
  * Let's Encrypt v01

This library maintains compatibility with le-acme-core so that it can be used as a **drop-in replacement**
and requires **no changes to existing code**,
but also provides an updated API more congruent with draft 11.

## le-acme-core-compatible API (recommended)

Status: Stable, Locked, Bugfix-only

See Full Documentation at <https://git.coolaj86.com/coolaj86/le-acme-core.js>

```
var RSA = require('rsa-compat').RSA;
var acme = require('acme-v2/compat.js').ACME.create({ RSA: RSA });

//
// Use exactly the same as le-acme-core
//
```

## Promise API (dev)

Status: Almost stable, but **not semver locked**

This API is a simple evolution of le-acme-core,
but tries to provide a better mapping to the new draft 11 APIs.

```
// Create Instance (Dependency Injection)
var ACME = require('acme-v2').ACME.create({
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
  // ask if the certificate can be issued up to 10 times before failing
, retryPoll: 8
  // ask if the certificate has been validated up to 6 times before cancelling
, retryPending: 4
  // Wait 1000ms between retries
, retryInterval: 1000
  // Wait 10,000ms after deauthorizing a challenge before retrying
, deauthWait: 10 * 1000
});


// Discover Directory URLs
ACME.init(acmeDirectoryUrl)                   // returns Promise<acmeUrls={keyChange,meta,newAccount,newNonce,newOrder,revokeCert}>


// Accounts
ACME.accounts.create(options)                 // returns Promise<regr> registration data

    { email: '<email>'                        //    valid email (server checks MX records)
    , accountKeypair: {                       //    privateKeyPem or privateKeyJwt
        privateKeyPem: '<ASCII PEM>'
      }
    , agreeToTerms: fn (tosUrl) {}            //    returns Promise with tosUrl
    }


// Registration
ACME.certificates.create(options)             // returns Promise<pems={ privkey (key), cert, chain (ca) }>

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

* v1.5
  * perform full test challenge first (even before nonce)
* v1.3
  * Use node RSA keygen by default
  * No non-optional external deps!
* v1.2
  * fix some API out-of-specness
  * doc some magic numbers (status)
  * updated deps
* v1.1.0
  * reduce dependencies (use lightweight @coolaj86/request instead of request)
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

[acme-v2.js](https://git.coolaj86.com/coolaj86/acme-v2.js) |
MPL-2.0 |
[Terms of Use](https://therootcompany.com/legal/#terms) |
[Privacy Policy](https://therootcompany.com/legal/#privacy)
