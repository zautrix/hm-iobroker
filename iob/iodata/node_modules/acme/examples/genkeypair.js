// Copyright 2018 AJ ONeal. All rights reserved
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';
var RSA = require('rsa-compat').RSA;
var fs = require('fs');

if (!fs.existsSync(__dirname + '/../tests/account.privkey.pem')) {
  RSA.generateKeypair(2048, 65537, {}, function (err, keypair) {
    console.log(keypair);
    var privkeyPem = RSA.exportPrivatePem(keypair)
    console.log(privkeyPem);

    fs.writeFileSync(__dirname + '/../tests/account.privkey.pem', privkeyPem);
  });
}

if (!fs.existsSync(__dirname + '/../tests/privkey.pem')) {
  RSA.generateKeypair(2048, 65537, {}, function (err, keypair) {
    console.log(keypair);
    var privkeyPem = RSA.exportPrivatePem(keypair)
    console.log(privkeyPem);

    fs.writeFileSync(__dirname + '/../tests/privkey.pem', privkeyPem);
  });
}
