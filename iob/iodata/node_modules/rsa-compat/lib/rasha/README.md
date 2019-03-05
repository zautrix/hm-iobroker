[Rasha.js](https://git.coolaj86.com/coolaj86/rasha.js) &middot; [![Build Status](https://strong-emu-11.telebit.io/api/badges/coolaj86/rasha.js/status.svg)](https://strong-emu-11.telebit.io/coolaj86/rasha.js)
=========

Sponsored by [Root](https://therootcompany.com).
Built for [ACME.js](https://git.coolaj86.com/coolaj86/acme.js)
and [Greenlock.js](https://git.coolaj86.com/coolaj86/greenlock.js)



| ~550 lines of code | 3kb gzipped | 10kb minified | 18kb with comments |

RSA tools. Lightweight. Zero Dependencies. Universal compatibility.

* [x] Fast and Easy RSA Key Generation
* [x] PEM-to-JWK
* [x] JWK-to-PEM
* [x] SSH "pub" format
* [ ] ECDSA
  * **Need EC or ECDSA tools?** Check out [Eckles.js](https://git.coolaj86.com/coolaj86/eckles.js)


## Generate RSA Key

Achieves the *fastest possible key generation* using node's native RSA bindings to OpenSSL,
then converts to JWK for ease-of-use.

```
Rasha.generate({ format: 'jwk' }).then(function (keypair) {
  console.log(keypair.private);
  console.log(keypair.public);
});
```

**options**

* `format` defaults to `'jwk'`
  * `'pkcs1'` (traditional)
  * `'pkcs8'` <!-- * `'ssh'` -->
* `modulusLength` defaults to 2048 (must not be lower)
  * generally you shouldn't pick a larger key size - they're slow
  * **2048** is more than sufficient
  * 3072 is way, way overkill and takes a few seconds to generate
  * 4096 can take about a minute to generate and is just plain wasteful

**advanced options**

These options are provided for debugging and should not be used.

* `publicExponent` defaults to 65537 (`0x10001`)

## PEM-to-JWK

* [x] PKCS#1 (traditional)
* [x] PKCS#8, SPKI/PKIX
* [x] 2048-bit, 3072-bit, 4096-bit (and ostensibily all others)
* [x] SSH (RFC4716), (RFC 4716/SSH2)

```js
var Rasha = require('rasha');
var pem = require('fs')
  .readFileSync('./node_modles/rasha/fixtures/privkey-rsa-2048.pkcs1.pem', 'ascii');

Rasha.import({ pem: pem }).then(function (jwk) {
  console.log(jwk);
});
```

```js
{
  "kty": "RSA",
  "n": "m2ttVBxPlWw06ZmGBWVDl...QlEz7UNNj9RGps_50-CNw",
  "e": "AQAB",
  "d": "Cpfo7Mm9Nu8YMC_xrZ54W...Our1IdDzJ_YfHPt9sHMQQ",
  "p": "ynG-t9HwKCN3MWRYFdnFz...E9S4DsGcAarIuOT2TsTCE",
  "q": "xIkAjgUzB1zaUzJtW2Zgv...38ahSrBFEVnxjpnPh1Q1c",
  "dp": "tzDGjECFOU0ehqtuqhcu...dVGAXJoGOdv5VpaZ7B1QE",
  "dq": "kh5dyDk7YCz7sUFbpsmu...aX9PKa12HFlny6K1daL48",
  "qi": "AlHWbx1gp6Z9pbw_1hlS...lhmIOgRApS0t9VoXtHhFU"
}
```

## JWK-to-PEM

* [x] PKCS#1 (traditional)
* [x] PKCS#8, SPKI/PKIX
* [x] 2048-bit, 4096-bit (and ostensibily all others)
* [x] SSH (RFC4716), (RFC 4716/SSH2)

```js
var Rasha = require('rasha');
var jwk = require('rasha/fixtures/privkey-rsa-2048.jwk.json');

Rasha.export({ jwk: jwk }).then(function (pem) {
  // PEM in PKCS1 (traditional) format
  console.log(pem);
});
```

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAm2ttVBxPlWw06ZmGBWVDlfjkPAJ4DgnY0TrDwtCohHzLxGhD
NzUJefLukC+xu0LBKylYojT5vTkxaOhxeSYo31syu4WhxbkTBLICOFcCGMob6pSQ
38P8LdAIlb0pqDHxEJ9adWomjuFf.....5cCBahfsiNtNR6WV1/iCSuINYs6uPdA
Jlw7hm9m8TAmFWWyfL0s7wiRvAYkQvpxetorTwHJVLabBDJ+WBOAY2enOLHIRQv+
atAvHrLXjkUdzF96o0icyF6n7QzGfUPmeWGYg6BEClLS31Whe0eEVQ==
-----END RSA PRIVATE KEY-----
```

### Advanced Options

`format: 'pkcs8'`:

The default output format `pkcs1` (RSA-specific format) is used for private keys.
Use `format: 'pkcs8'` to output in PKCS#8 format instead.

```js
Rasha.export({ jwk: jwk, format: 'pkcs8' }).then(function (pem) {
  // PEM in PKCS#8 format
  console.log(pem);
});
```

```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCba21UHE+VbDTp
mYYFZUOV+OQ8AngOCdjROsPC0KiEfMvEaEM3NQl58u6QL7G7QsErKViiNPm9OTFo
6HF5JijfWzK7haHFuRMEsgI4VwIY.....LorV1ovjwKBgAJR1m8dYKemfaW8P9YZ
Uux7lwIFqF+yI201HpZXX+IJK4g1izq490AmXDuGb2bxMCYVZbJ8vSzvCJG8BiRC
+nF62itPAclUtpsEMn5YE4BjZ6c4schFC/5q0C8esteORR3MX3qjSJzIXqftDMZ9
Q+Z5YZiDoEQKUtLfVaF7R4RV
-----END PRIVATE KEY-----
```

`format: 'ssh'`:

Although SSH uses PKCS#1 for private keys, it uses ts own special non-ASN1 format
(affectionately known as rfc4716) for public keys. I got curious and then decided
to add this format as well.

To get the same format as you
would get with `ssh-keygen`, pass `ssh` as the format option:

```js
Rasha.export({ jwk: jwk, format: 'ssh' }).then(function (pub) {
  // Special SSH2 Public Key format (RFC 4716)
  console.log(pub);
});
```

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCba21UHE.....Q02P1Eamz/nT4I3 rsa@localhost
```

`public: 'true'`:

If a private key is used as input, a private key will be output.

If you'd like to output a public key instead you can pass `public: true`.

or `format: 'spki'`.

```js
Rasha.export({ jwk: jwk, public: true }).then(function (pem) {
  // PEM in SPKI/PKIX format
  console.log(pem);
});
```

```
-----BEGIN PUBLIC KEY-----
MIIBCgKCAQEAm2ttVBxPlWw06ZmGBWVDlfjkPAJ4DgnY0TrDwtCohHzLxGhDNzUJ
efLukC+xu0LBKylYojT5vTkxaOhx.....TmzCh2ikrwTMja7mUdBJf2bK3By5AB0
Qi49OykUCfNZeQlEz7UNNj9RGps/50+CNwIDAQAB
-----END PUBLIC KEY-----
```

Testing
-------

All cases are tested in `test.sh`.

You can compare these keys to the ones that you get from OpenSSL, OpenSSH/ssh-keygen, and WebCrypto:

```bash
# Generate 2048-bit RSA Keypair
openssl genrsa -out privkey-rsa-2048.pkcs1.pem 2048

# Convert PKCS1 (traditional) RSA Keypair to PKCS8 format
openssl rsa -in privkey-rsa-2048.pkcs1.pem -pubout -out pub-rsa-2048.spki.pem

# Export Public-only RSA Key in PKCS1 (traditional) format
openssl pkcs8 -topk8 -nocrypt -in privkey-rsa-2048.pkcs1.pem -out privkey-rsa-2048.pkcs8.pem

# Convert PKCS1 (traditional) RSA Public Key to SPKI/PKIX format
openssl rsa -in pub-rsa-2048.spki.pem -pubin -RSAPublicKey_out -out pub-rsa-2048.pkcs1.pem

# Convert RSA public key to SSH format
ssh-keygen -f ./pub-rsa-2048.spki.pem -i -mPKCS8 > ./pub-rsa-2048.ssh.pub
```

Goals of this project
-----

* Focused support for 2048-bit and 4096-bit RSA keypairs (although any size is technically supported)
* Zero Dependencies
* VanillaJS
* Quality Code: Good comments and tests
* Convert both ways: PEM-to-JWK and JWK-to-PEM (also supports SSH pub files)
* Browser support as well (TODO)
* OpenSSL, ssh-keygen, and WebCrypto compatibility

Legal
-----

[Rasha.js](https://git.coolaj86.com/coolaj86/rasha.js) |
MPL-2.0 |
[Terms of Use](https://therootcompany.com/legal/#terms) |
[Privacy Policy](https://therootcompany.com/legal/#privacy)
