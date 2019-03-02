// Copyright 2018 AJ ONeal. All rights reserved
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

module.exports.run = function run(directoryUrl, RSA, web, chType, email, accountKeypair, domainKeypair) {
  // [ 'test.ppl.family' ] 'coolaj86@gmail.com''http-01'
  var acme2 = require('../').ACME.create({ RSA: RSA });
  acme2.init(directoryUrl).then(function () {
    var options = {
      agreeToTerms: function (tosUrl, agree) {
        agree(null, tosUrl);
      }
    , setChallenge: function (opts, cb) {
        var pathname;

        console.log("");
        console.log('identifier:');
        console.log(opts.identifier);
        console.log('hostname:');
        console.log(opts.hostname);
        console.log('type:');
        console.log(opts.type);
        console.log('token:');
        console.log(opts.token);
        console.log('thumbprint:');
        console.log(opts.thumbprint);
        console.log('keyAuthorization:');
        console.log(opts.keyAuthorization);
        console.log('dnsAuthorization:');
        console.log(opts.dnsAuthorization);
        console.log("");

        if ('http-01' === opts.type) {
          pathname = opts.hostname + acme2.challengePrefixes['http-01'] + "/" + opts.token;
          console.log("Put the string '" + opts.keyAuthorization + "' into a file at '" + pathname + "'");
          console.log("echo '" + opts.keyAuthorization + "' > '" + pathname + "'");
        } else if ('dns-01' === opts.type) {
          pathname = acme2.challengePrefixes['dns-01'] + "." + opts.hostname.replace(/^\*\./, '');
          console.log("Put the string '" + opts.dnsAuthorization + "' into the TXT record '" + pathname + "'");
          console.log("ddig TXT " + pathname + " '" + opts.dnsAuthorization + "'");
        } else {
          cb(new Error("[acme-v2] unrecognized challenge type"));
          return;
        }
        console.log("\nThen hit the 'any' key to continue...");

        function onAny() {
          console.log("'any' key was hit");
          process.stdin.pause();
          process.stdin.removeListener('data', onAny);
          process.stdin.setRawMode(false);
          cb();
        }

        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', onAny);
      }
    , removeChallenge: function (opts, cb) {
        // hostname, key
        console.log('[acme-v2] remove challenge', opts.hostname, opts.keyAuthorization);
        setTimeout(cb, 1 * 1000);
      }
    , challengeType: chType
    , email: email
    , accountKeypair: accountKeypair
    , domainKeypair: domainKeypair
    , domains: web
    };

    acme2.accounts.create(options).then(function (account) {
      console.log('[acme-v2] account:');
      console.log(account);

      acme2.certificates.create(options).then(function (fullchainPem) {
        console.log('[acme-v2] fullchain.pem:');
        console.log(fullchainPem);
      });
    });
  });
};
