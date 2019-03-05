// Copyright 2018 AJ ONeal. All rights reserved
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

var readline = require('readline');
var inquisitor = {};
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

require('./genkeypair.js');

inquisitor.getWeb = function getWeb() {
  rl.question('What web address(es) would you like to get certificates for? (ex: example.com,*.example.com) ', function (web) {
    web = (web||'').trim().split(/,/g);
    if (!web[0]) { inquisitor.getWeb(); return; }

    if (web.some(function (w) { return '*' === w[0]; })) {
      console.log('Wildcard domains must use dns-01');
      inquisitor.getEmail(web, 'dns-01');
    } else {
      inquisitor.getChallengeType(web);
    }
  });
};

inquisitor.getChallengeType = function getChallengeType(web) {
  rl.question('What challenge will you be testing today? http-01 or dns-01? [http-01] ', function (chType) {
    chType = (chType||'').trim();
    if (!chType) { chType = 'http-01'; }

    inquisitor.getEmail(web, chType);
  });
};

inquisitor.getEmail = function getEmail(web, chType) {
  rl.question('What email should we use? (optional) ', function (email) {
    email = (email||'').trim();
    if (!email) { email = null; }

    inquisitor.getDirectoryUrl(web, chType, email);
  });
};

inquisitor.getDirectoryUrl = function getDirectoryUrl(web, chType, email) {
  var defaultDirectoryUrl = 'https://acme-staging-v02.api.letsencrypt.org/directory';
  rl.question('What directoryUrl should we use? [' + defaultDirectoryUrl + '] ', function (directoryUrl) {
    directoryUrl = (directoryUrl||'').trim();
    if (!directoryUrl) { directoryUrl = 'https://acme-staging-v02.api.letsencrypt.org/directory'; }

    inquisitor.run(directoryUrl, web, chType, email);
  });
};

inquisitor.run = function run(directoryUrl, web, chType, email) {
  rl.close();

  var RSA = require('rsa-compat').RSA;
  var accountKeypair = RSA.import({ privateKeyPem: require('fs').readFileSync(__dirname + '/../tests/account.privkey.pem') });
  var domainKeypair = RSA.import({ privateKeyPem: require('fs').readFileSync(__dirname + '/../tests/privkey.pem') });

  require('../tests/promise.js').run(directoryUrl, RSA, web, chType, email, accountKeypair, domainKeypair);
};

inquisitor.getWeb();
