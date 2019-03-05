'use strict';

var Enc = require('./encoding.js');
var PEM = module.exports;

PEM.packBlock = function (opts) {
  // TODO allow for headers?
  return '-----BEGIN ' + opts.type + '-----\n'
    + Enc.bufToBase64(opts.bytes).match(/.{1,64}/g).join('\n') + '\n'
    + '-----END ' + opts.type + '-----'
  ;
};
