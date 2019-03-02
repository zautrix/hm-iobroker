// Copyright 2018 AJ ONeal. All rights reserved
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

var RSA = require('rsa-compat').RSA;
var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

require('./genkeypair.js');

function getWeb() {
  rl.question('What web address(es) would you like to get certificates for? (ex: example.com,*.example.com) ', function (web) {
    web = (web||'').trim().split(/,/g);
    if (!web[0]) { getWeb(); return; }

    if (web.some(function (w) { return '*' === w[0]; })) {
      console.log('Wildcard domains must use dns-01');
      getEmail(web, 'dns-01');
    } else {
      getChallengeType(web);
    }
  });
}

function getChallengeType(web) {
  rl.question('What challenge will you be testing today? http-01 or dns-01? [http-01] ', function (chType) {
    chType = (chType||'').trim();
    if (!chType) { chType = 'http-01'; }

    getEmail(web, chType);
  });
}

function getEmail(web, chType) {
  rl.question('What email should we use? (optional) ', function (email) {
    email = (email||'').trim();
    if (!email) { email = null; }

    getApiStyle(web, chType, email);
  });
}

function getApiStyle(web, chType, email) {
  var defaultStyle = 'compat';
  rl.question('What API style would you like to test? v1-compat or promise? [v1-compat] ', function (apiStyle) {
    apiStyle = (apiStyle||'').trim();
    if (!apiStyle) { apiStyle = 'v1-compat'; }

    rl.close();

    var RSA = require('rsa-compat').RSA;
    var accountKeypair = RSA.import({ privateKeyPem: require('fs').readFileSync(__dirname + '/../tests/account.privkey.pem') });
    var domainKeypair = RSA.import({ privateKeyPem: require('fs').readFileSync(__dirname + '/../tests/privkey.pem') });
    var directoryUrl = 'https://acme-staging-v02.api.letsencrypt.org/directory';

    if ('promise' === apiStyle) {
      require('../tests/promise.js').run(directoryUrl, RSA, web, chType, email, accountKeypair, domainKeypair);
    } else if ('cb' === apiStyle) {
      require('../tests/cb.js').run(directoryUrl, RSA, web, chType, email, accountKeypair, domainKeypair);
    } else {
      if ('v1-compat' !== apiStyle) { console.warn("Didn't understand '" + apiStyle + "', using 'v1-compat' instead..."); }
      require('../tests/compat.js').run(directoryUrl, RSA, web, chType, email, accountKeypair, domainKeypair);
    }
  });
}

getWeb();
