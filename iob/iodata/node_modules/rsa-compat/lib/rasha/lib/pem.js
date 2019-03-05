'use strict';

var PEM = module.exports;
var Enc = require('./encoding.js');

PEM.parseBlock = function pemToDer(pem) {
  var lines = pem.trim().split(/\n/);
  var end = lines.length - 1;
  var head = lines[0].match(/-----BEGIN (.*)-----/);
  var foot = lines[end].match(/-----END (.*)-----/);

  if (head) {
    lines = lines.slice(1, end);
    head = head[1];
    if (head !== foot[1]) {
      throw new Error("headers and footers do not match");
    }
  }

  return { type: head, bytes: Enc.base64ToBuf(lines.join('')) };
};

PEM.packBlock = function (opts) {
  return '-----BEGIN ' + opts.type + '-----\n'
    + Enc.bufToBase64(opts.bytes).match(/.{1,64}/g).join('\n') + '\n'
    + '-----END ' + opts.type + '-----'
  ;
};
