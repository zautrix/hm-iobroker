'use strict';

var ASN1 = require('./asn1.js');
var Enc = require('./encoding.js');

var X509 = module.exports;

X509.packCsr = function (asn1pubkey, domains) {
  return ASN1('30'
    // Version (0)
  , ASN1.UInt('00')

    // 2.5.4.3 commonName (X.520 DN component)
  , ASN1('30', ASN1('31', ASN1('30', ASN1('06', '550403'), ASN1('0c', Enc.utf8ToHex(domains[0])))))

    // Public Key (RSA or EC)
  , asn1pubkey

    // Request Body
  , ASN1('a0'
    , ASN1('30'
        // 1.2.840.113549.1.9.14 extensionRequest (PKCS #9 via CRMF)
      , ASN1('06', '2a864886f70d01090e')
      , ASN1('31'
        , ASN1('30'
          , ASN1('30'
              // 2.5.29.17 subjectAltName (X.509 extension)
            , ASN1('06', '551d11')
            , ASN1('04'
              , ASN1('30', domains.map(function (d) {
                  return ASN1('82', Enc.utf8ToHex(d));
                }).join(''))))))))
  );
};

X509.packPkcs1 = function (jwk) {
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

X509.packCsrPublicKey = function (jwk) {
  // Sequence the key
  var n = ASN1.UInt(Enc.base64ToHex(jwk.n));
  var e = ASN1.UInt(Enc.base64ToHex(jwk.e));
  var asn1pub = ASN1('30', n, e);
  //var asn1pub = X509.packPkcs1({ kty: jwk.kty, n: jwk.n, e: jwk.e });

  // Add the CSR pub key header
  return ASN1('30', ASN1('30', ASN1('06', '2a864886f70d010101'), ASN1('05')), ASN1.BitStr(asn1pub));
};
