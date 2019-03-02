// Copyright 2018 AJ ONeal. All rights reserved
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

/*
-----BEGIN CERTIFICATE-----LF
xxxLF
yyyLF
-----END CERTIFICATE-----LF
LF
-----BEGIN CERTIFICATE-----LF
xxxLF
yyyLF
-----END CERTIFICATE-----LF

Rules
  * Only Unix LF (\n) Line endings
  * Each PEM's lines are separated with \n
  * Each PEM ends with \n
  * Each PEM is separated with a \n (just like commas separating an array)
*/

// https://github.com/certbot/certbot/issues/5721#issuecomment-402362709
var expected = "----\nxxxx\nyyyy\n----\n\n----\nxxxx\nyyyy\n----\n";
var tests = [
  "----\r\nxxxx\r\nyyyy\r\n----\r\n\r\n----\r\nxxxx\r\nyyyy\r\n----\r\n"
, "----\r\nxxxx\r\nyyyy\r\n----\r\n----\r\nxxxx\r\nyyyy\r\n----\r\n"
, "----\nxxxx\nyyyy\n----\n\n----\r\nxxxx\r\nyyyy\r\n----"
, "----\nxxxx\nyyyy\n----\n----\r\nxxxx\r\nyyyy\r\n----"
, "----\nxxxx\nyyyy\n----\n----\nxxxx\nyyyy\n----"
, "----\nxxxx\nyyyy\n----\n----\nxxxx\nyyyy\n----\n"
, "----\nxxxx\nyyyy\n----\n\n----\nxxxx\nyyyy\n----\n"
, "----\nxxxx\nyyyy\n----\r\n----\nxxxx\ryyyy\n----\n"
];

function formatPemChain(str) {
  return str.trim().replace(/[\r\n]+/g, '\n').replace(/\-\n\-/g, '-\n\n-') + '\n';
}
function splitPemChain(str) {
  return str.trim().split(/[\r\n]{2,}/g).map(function (str) {
    return str + '\n';
  });
}

tests.forEach(function (str) {
  var actual = formatPemChain(str);
  if (expected !== actual) {
    console.error('input:   ', JSON.stringify(str));
    console.error('expected:', JSON.stringify(expected));
    console.error('actual:  ', JSON.stringify(actual));
    throw new Error("did not pass");
  }
});

if (
  "----\nxxxx\nyyyy\n----\n"
  !==
  formatPemChain("\n\n----\r\nxxxx\r\nyyyy\r\n----\n\n")
) {
  throw new Error("Not proper for single cert in chain");
}

if (
  "--B--\nxxxx\nyyyy\n--E--\n\n--B--\nxxxx\nyyyy\n--E--\n\n--B--\nxxxx\nyyyy\n--E--\n"
  !==
  formatPemChain("\n\n\n--B--\nxxxx\nyyyy\n--E--\n\n\n\n--B--\nxxxx\nyyyy\n--E--\n\n\n--B--\nxxxx\nyyyy\n--E--\n\n\n")
) {
  throw new Error("Not proper for three certs in chain");
}

splitPemChain(
  "--B--\nxxxx\nyyyy\n--E--\n\n--B--\nxxxx\nyyyy\n--E--\n\n--B--\nxxxx\nyyyy\n--E--\n"
).forEach(function (str) {
  if ("--B--\nxxxx\nyyyy\n--E--\n" !== str) {
    throw new Error("bad thingy");
  }
});

console.info('PASS');
