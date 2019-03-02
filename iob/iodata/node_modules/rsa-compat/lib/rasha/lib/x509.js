'use strict';

var x509 = module.exports;
var ASN1 = require('./asn1.js');
var Enc = require('./encoding.js');

x509.guess = function (der, asn1) {
  // accepting der for compatability with other usages

  var meta = { kty: 'RSA', format: 'pkcs1', public: true };
  //meta.asn1 = ASN1.parse(u8);

  if (asn1.children.every(function(el) {
    return 0x02 === el.type;
  })) {
    if (2 === asn1.children.length) {
      // rsa pkcs1 public
      return meta;
    } else if (asn1.children.length >= 9) {
      // the standard allows for "otherPrimeInfos", hence at least 9
      meta.public = false;
      // rsa pkcs1 private
      return meta;
    } else {
      throw new Error("not an RSA PKCS#1 public or private key (wrong number of ints)");
    }
  } else {
    meta.format = 'pkcs8';
  }

  return meta;
};

x509.parsePkcs1 = function parseRsaPkcs1(buf, asn1, jwk) {
  if (!asn1.children.every(function(el) {
    return 0x02 === el.type;
  })) {
    throw new Error("not an RSA PKCS#1 public or private key (not all ints)");
  }

  if (2 === asn1.children.length) {

    jwk.n = Enc.bufToUrlBase64(asn1.children[0].value);
    jwk.e = Enc.bufToUrlBase64(asn1.children[1].value);
    return jwk;

  } else if (asn1.children.length >= 9) {
    // the standard allows for "otherPrimeInfos", hence at least 9

    jwk.n = Enc.bufToUrlBase64(asn1.children[1].value);
    jwk.e = Enc.bufToUrlBase64(asn1.children[2].value);
    jwk.d = Enc.bufToUrlBase64(asn1.children[3].value);
    jwk.p = Enc.bufToUrlBase64(asn1.children[4].value);
    jwk.q = Enc.bufToUrlBase64(asn1.children[5].value);
    jwk.dp = Enc.bufToUrlBase64(asn1.children[6].value);
    jwk.dq = Enc.bufToUrlBase64(asn1.children[7].value);
    jwk.qi = Enc.bufToUrlBase64(asn1.children[8].value);
    return jwk;

  } else {
    throw new Error("not an RSA PKCS#1 public or private key (wrong number of ints)");
  }
};

x509.parsePkcs8 = function parseRsaPkcs8(buf, asn1, jwk) {
  if (2 === asn1.children.length
    && 0x03 === asn1.children[1].type
    && 0x30 === asn1.children[1].value[0]) {

    asn1 = ASN1.parse(asn1.children[1].value);
    jwk.n = Enc.bufToUrlBase64(asn1.children[0].value);
    jwk.e = Enc.bufToUrlBase64(asn1.children[1].value);

  } else if (3 === asn1.children.length
    && 0x04 === asn1.children[2].type
    && 0x30 === asn1.children[2].children[0].type
    && 0x02 === asn1.children[2].children[0].children[0].type) {

    asn1 = asn1.children[2].children[0];
    jwk.n = Enc.bufToUrlBase64(asn1.children[1].value);
    jwk.e = Enc.bufToUrlBase64(asn1.children[2].value);
    jwk.d = Enc.bufToUrlBase64(asn1.children[3].value);
    jwk.p = Enc.bufToUrlBase64(asn1.children[4].value);
    jwk.q = Enc.bufToUrlBase64(asn1.children[5].value);
    jwk.dp = Enc.bufToUrlBase64(asn1.children[6].value);
    jwk.dq = Enc.bufToUrlBase64(asn1.children[7].value);
    jwk.qi = Enc.bufToUrlBase64(asn1.children[8].value);

  } else {
    throw new Error("not an RSA PKCS#8 public or private key (wrong format)");
  }
  return jwk;
};

x509.packPkcs1 = function (jwk) {
  var n = ASN1.UInt(Enc.base64ToHex(jwk.n));
  var e = ASN1.UInt(Enc.base64ToHex(jwk.e));

  if (!jwk.d) {
    return Enc.hexToBuf(ASN1('30', n, e));
  }

  return Enc.hexToBuf(ASN1('30'
  , ASN1.UInt('00')
  , n
  , e
  , ASN1.UInt(Enc.base64ToHex(jwk.d))
  , ASN1.UInt(Enc.base64ToHex(jwk.p))
  , ASN1.UInt(Enc.base64ToHex(jwk.q))
  , ASN1.UInt(Enc.base64ToHex(jwk.dp))
  , ASN1.UInt(Enc.base64ToHex(jwk.dq))
  , ASN1.UInt(Enc.base64ToHex(jwk.qi))
  ));
};

x509.packPkcs8 = function (jwk) {
  if (!jwk.d) {
    // Public RSA
    return Enc.hexToBuf(ASN1('30'
      , ASN1('30'
        , ASN1('06', '2a864886f70d010101')
        , ASN1('05')
      )
      , ASN1.BitStr(ASN1('30'
        , ASN1.UInt(Enc.base64ToHex(jwk.n))
        , ASN1.UInt(Enc.base64ToHex(jwk.e))
      ))
    ));
  }

  // Private RSA
  return Enc.hexToBuf(ASN1('30'
    , ASN1.UInt('00')
    , ASN1('30'
      , ASN1('06', '2a864886f70d010101')
      , ASN1('05')
    )
    , ASN1('04'
      , ASN1('30'
        , ASN1.UInt('00')
        , ASN1.UInt(Enc.base64ToHex(jwk.n))
        , ASN1.UInt(Enc.base64ToHex(jwk.e))
        , ASN1.UInt(Enc.base64ToHex(jwk.d))
        , ASN1.UInt(Enc.base64ToHex(jwk.p))
        , ASN1.UInt(Enc.base64ToHex(jwk.q))
        , ASN1.UInt(Enc.base64ToHex(jwk.dp))
        , ASN1.UInt(Enc.base64ToHex(jwk.dq))
        , ASN1.UInt(Enc.base64ToHex(jwk.qi))
      )
    )
  ));
};
x509.packSpki = x509.packPkcs8;
