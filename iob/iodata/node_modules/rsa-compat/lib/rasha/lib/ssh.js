'use strict';

var SSH = module.exports;
var Enc = require('./encoding.js');

              //  7  s  s  h  -  r  s  a
SSH.RSA = '00000007 73 73 68 2d 72 73 61'.replace(/\s+/g, '').toLowerCase();

SSH.parse = function (pem, jwk) {

  var parts = pem.split(/\s+/);
  var buf = Enc.base64ToBuf(parts[1]);
  var els = [];
  var index = 0;
  var len;
  var i = 0;
  var offset = (buf.byteOffset || 0);
  // using dataview to be browser-compatible (I do want _some_ code reuse)
  var dv = new DataView(buf.buffer.slice(offset, offset + buf.byteLength));
  var el;

  if (SSH.RSA !== Enc.bufToHex(buf.slice(0, SSH.RSA.length/2))) {
    throw new Error("does not lead with ssh header");
  }

  while (index < buf.byteLength) {
    i += 1;
    if (i > 3) { throw new Error("15+ elements, probably not a public ssh key"); }
    len = dv.getUint32(index, false);
    index += 4;
    el = buf.slice(index, index + len);
    // remove BigUInt '00' prefix
    if (0x00 === el[0]) {
      el = el.slice(1);
    }
    els.push(el);
    index += len;
  }

  jwk.n = Enc.bufToUrlBase64(els[2]);
  jwk.e = Enc.bufToUrlBase64(els[1]);

  return jwk;
};

SSH.pack = function (opts) {
  var jwk = opts.jwk;
  var header = 'ssh-rsa';
  var comment = opts.comment || 'rsa@localhost';
  var e = SSH._padHexInt(Enc.base64ToHex(jwk.e));
  var n = SSH._padHexInt(Enc.base64ToHex(jwk.n));
  var hex = [
    SSH._numToUint32Hex(header.length)
  , Enc.strToHex(header)
  , SSH._numToUint32Hex(e.length/2)
  , e
  , SSH._numToUint32Hex(n.length/2)
  , n
  ].join('');
  return [ header, Enc.hexToBase64(hex), comment ].join(' ');
};

SSH._numToUint32Hex = function (num) {
  var hex = num.toString(16);
  while (hex.length < 8) {
    hex = '0' + hex;
  }
  return hex;
};

SSH._padHexInt = function (hex) {
  // BigInt is negative if the high order bit 0x80 is set,
  // so ASN1, SSH, and many other formats pad with '0x00'
  // to signifiy a positive number.
  var i = parseInt(hex.slice(0, 2), 16);
  if (0x80 & i) {
    return '00' + hex;
  }
  return hex;
};
