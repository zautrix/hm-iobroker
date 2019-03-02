[RSA-CSR.js](https://git.coolaj86.com/coolaj86/rsa-csr.js)
==========

Sponsored by [Root](https://therootcompany.com),
built for [ACME.js](https://git.coolaj86.com/coolaj86/acme.js)
and [Greenlock.js](https://git.coolaj86.com/coolaj86/greenlock-express.js)

A focused, **zero-dependency** library that can do exactly one thing really, really well:
  * Generate a Certificate Signing Requests (CSR), and sign it!

| < 300 lines of code | 1.7k gzipped | 4.7k minified | 8.5k with comments |

Need JWK-to-PEM? Try [Rasha.js](https://git.coolaj86.com/coolaj86/rasha.js)

Need to generate an EC CSR? Try [ECSDA-CSR.js](https://git.coolaj86.com/coolaj86/ecdsa-csr.js)

Features
========

* [x] Universal CSR support (RSA signing) that Just Works&trade;
  * Common Name (CN) Subject
  * Subject Alternative Names (SANs / altnames)
  * 2048, 3072, and 4096 bit JWK RSA
  * RSASSA PKCS1 v1.5
* [x] Zero Dependencies
  * (no ASN1.js, PKI.js, forge, jrsasign - not even elliptic.js!)
* [x] Quality
  * Focused
  * Lightweight
  * Well-Commented, Well-Documented
  * Secure
* [x] Vanilla Node.js
  * no school like the old school
  * easy to read and understand

Usage
-----

Given an array of domains it uses the first for the  Common Name (CN),
also known as Subject, and all of them as the Subject Alternative Names (SANs or altnames).

```js
'use strict';

var rsacsr = require('rsa-csr');
var key = {
  "kty": "RSA",
  "n": "m2tt...-CNw",
  "e": "AQAB",
  "d": "Cpfo...HMQQ",
  "p": "ynG-...sTCE",
  "q": "xIkA...1Q1c",
  "dp": "tzDG...B1QE",
  "dq": "kh5d...aL48",
  "qi": "AlHW...HhFU"
};
var domains = [ 'example.com', 'www.example.com' ];

return rsacsr({ key: key, domains: domains }).then(function (csr) {
  console.log('CSR PEM:');
  console.log(csr);
});
```

The output will look something like this (but much longer):

```
-----BEGIN CERTIFICATE REQUEST-----
MIIClTCCAX0CAQAwFjEUMBIGA1UEAwwLZXhhbXBsZS5jb20wggEiMA0GCSqGSIb3
DQEBAQUAA4IBDwAwggEKAoIBAQCba21UHE+VbDTpmYYFZUOV+OQ8AngOCdjROsPC
0KiEfMvEaEM3NQl58u6QL7G7QsEr.....3pIpUUkx5WbwJY6xDrCyFKG8ktpnee6
WjpTOBnpgHUI1/5ydnf0v29L9N+ALIJGKQxhub3iqB6EhCl93iiQtf4e7M/lzX7l
c1xqsSwVZ3RQVY9bRP9NdGuW4hVvscy5ypqRtXPXQpxMnYwfi9qW5Uo=
-----END CERTIFICATE REQUEST-----
```

#### PEM-to-JWK

If you need to convert a PEM to JWK first, do so:

```js
var Rasha = require('rasha');

Rasha.import({ pem: "-----BEGIN RSA PRIVATE KEY-----\nMIIEpAI..." }).then(function (jwk) {
  console.log(jwk);
})
```

#### CLI

You're probably better off using OpenSSL for most commandline tasks,
but the `rsa-csr` and `rasha` CLIs are useful for testing and debugging.

```bash
npm install -g rsa-csr
npm install -g rasha

rasha ./privkey.pem > ./privkey.jwk.json
rsa-csr ./privkey.jwk.json example.com,www.example.com > csr.pem
```

### Options

* `key` should be a JWK
  * Need PEM support? Use [Rasha.js](https://git.coolaj86.com/coolaj86/rasha.js).
  * (supports PEM, DER, PKCS#1 and PKCS#8)
* `domains` must be a list of strings representing domain names
  * correctly handles utf-8
  * you may also use punycoded, if needed
* `subject` will be `domains[0]` by default
  * you shouldn't use this unless you need to
  * you may need to if you need utf-8 for domains, but punycode for the subject

### Testing

You can double check that the CSR you get out is actually valid:

```bash
# Generate a key, if needed
openssl genrsa -out ./privkey-rsa.pkcs1.pem $keysize

# Convert to JWK
rasha ./privkey-rsa.pkcs1.pem > ./privkey-rsa.jwk.json

# Create a CSR with your domains
npx rsa-csr ./privkey-rsa.jwk.json example.com,www.example.com > csr.pem

# Verify
openssl req -text -noout -verify -in csr.pem
```

New to Crypto?
--------------

Just a heads up in case you have no idea what you're doing:

First of all, [don't panic](https://coolaj86.com/articles/dont-panic.html).

Next:

* RSA stands for... well, that doesn't matter, actually.
* DSA stands for _Digital Signing Algorithm_.
* RSA a separate standard from EC/ECDSA, but both are *asymmetric*
* Private keys are actually keypairs (they contain the public key)

In many cases the terms get used (and misused) interchangably,
which can be confusing. You'll survive, I promise.

* PEM is just a Base64-encoded DER (think JSON as hex or base64)
* DER is an binary _object notation_ for ASN.1 (think actual stringified JSON or XML)
* ASN.1 is _object notation_ standard (think JSON, the standard)
* X.509 is a suite of schemas (think XLST or json-schema.org)
* PKCS#8, PKIK, SPKI are all X.509 schemas (think defining `firstName` vs `first_name` vs `firstname`)

Now forget about all that and just know this:

**This library solves your problem if** you need RSA _something-or-other_ and CSR _something-or-other_
in order to deal with SSL certificates in an internal organization.

If that's not what you're doing, you may want HTTPS and SSL through
[Greenlock.js](https://git.coolaj86.com/coolaj86/greenlock-express.js),
or you may be looking for something else entirely.

Goals vs Non-Goals
-----

This was built for use by [ACME.js](https://git.coolaj86.com/coolaj86/acme.js)
and [Greenlock.js](https://git.coolaj86.com/coolaj86/greenlock-express.js).

Rather than trying to make a generic implementation that works with everything under the sun,
this library is intentionally focused on around the use case of generating certificates for
ACME services (such as Let's Encrypt).

That said, [please tell me](https://git.coolaj86.com/coolaj86/rsa-csr.js/issues) if it doesn't
do what you need, it may make sense to add it (or otherwise, perhaps to help you create a fork).

The primary goal of this project is for this code to do exactly (and all of)
what it needs to do - No more, no less.

* Support RSA JWKs
  * 2048-bit
  * 3072-bit
  * 4096-bit
* Support PEM and DER via Rasha.js
  * PKCS#1 (traditional)
  * PKCS#8
  * RSASSA-PKCS1-v1_5
* Vanilla node.js (ECMAScript 5.1)
  * No babel
  * No dependencies

However, there are a few areas where I'd be willing to stretch:

* Type definition files for altscript languages

It is not a goal of this project to support any RSA profiles
except those that are universally supported by browsers and
are sufficiently secure (overkill is overkill).

> A little copying is better than a little dependency. - [Go Proverbs](https://go-proverbs.github.io) by Rob Pike

This code is considered small and focused enough that,
rather than making it a dependency in other small projects,
I personally just copy over the code.

Hence, all of these projects are MPL-2.0 licensed.

Legal
-----

[RSA-CSR.js](https://git.coolaj86.com/coolaj86/rsa-csr.js) |
MPL-2.0 |
[Terms of Use](https://therootcompany.com/legal/#terms) |
[Privacy Policy](https://therootcompany.com/legal/#privacy)
