// Copyright 2018 AJ ONeal. All rights reserved
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

var https = require('https');
var server = https.createServer({
  key: require('fs').readFileSync('../tests/privkey.pem')
, cert: require('fs').readFileSync('../tests/fullchain.pem')
}, function (req, res) {
  res.end("Hello, World!");
}).listen(443, function () {
  console.log('Listening on', this.address());
});
