'use strict';

var Enc = module.exports;

Enc.base64ToHex = function base64ToHex(b64) {
  return Buffer.from(b64, 'base64').toString('hex').toLowerCase();
};

Enc.bufToBase64 = function bufToBase64(u8) {
  // we want to maintain api compatability with browser APIs,
  // so we assume that this could be a Uint8Array
  return Buffer.from(u8).toString('base64');
};

Enc.bufToHex = function toHex(u8) {
  return Buffer.from(u8).toString('hex').toLowerCase();
};

Enc.hexToBuf = function (hex) {
  return Buffer.from(hex, 'hex');
};

Enc.numToHex = function numToHex(d) {
  d = d.toString(16);
  if (d.length % 2) {
    return '0' + d;
  }
  return d;
};

Enc.utf8ToHex = function utf8ToHex(str) {
  // node can properly handle utf-8 strings
  return Buffer.from(str).toString('hex').toLowerCase();
};
