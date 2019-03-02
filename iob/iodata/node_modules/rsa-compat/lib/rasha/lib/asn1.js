'use strict';

//
// A dumbed-down, minimal ASN.1 parser / packer combo
//
// Note: generally I like to write congruent code
// (i.e. output can be used as input and vice-versa)
// However, this seemed to be more readable and easier
// to use written as-is, asymmetrically.
// (I also generally prefer to export objects rather
// functions but, yet again, asthetics one in this case)

var Enc = require('./encoding.js');

//
// Packer
//

// Almost every ASN.1 type that's important for CSR
// can be represented generically with only a few rules.
var ASN1 = module.exports = function ASN1(/*type, hexstrings...*/) {
  var args = Array.prototype.slice.call(arguments);
  var typ = args.shift();
  var str = args.join('').replace(/\s+/g, '').toLowerCase();
  var len = (str.length/2);
  var lenlen = 0;
  var hex = typ;

  // We can't have an odd number of hex chars
  if (len !== Math.round(len)) {
    throw new Error("invalid hex");
  }

  // The first byte of any ASN.1 sequence is the type (Sequence, Integer, etc)
  // The second byte is either the size of the value, or the size of its size

  // 1. If the second byte is < 0x80 (128) it is considered the size
  // 2. If it is > 0x80 then it describes the number of bytes of the size
  //    ex: 0x82 means the next 2 bytes describe the size of the value
  // 3. The special case of exactly 0x80 is "indefinite" length (to end-of-file)

  if (len > 127) {
    lenlen += 1;
    while (len > 255) {
      lenlen += 1;
      len = len >> 8;
    }
  }

  if (lenlen) { hex += Enc.numToHex(0x80 + lenlen); }
  return hex + Enc.numToHex(str.length/2) + str;
};

// The Integer type has some special rules
ASN1.UInt = function UINT() {
  var str = Array.prototype.slice.call(arguments).join('');
  var first = parseInt(str.slice(0, 2), 16);

  // If the first byte is 0x80 or greater, the number is considered negative
  // Therefore we add a '00' prefix if the 0x80 bit is set
  if (0x80 & first) { str = '00' + str; }

  return ASN1('02', str);
};

// The Bit String type also has a special rule
ASN1.BitStr = function BITSTR() {
  var str = Array.prototype.slice.call(arguments).join('');
  // '00' is a mask of how many bits of the next byte to ignore
  return ASN1('03', '00' + str);
};


//
// Parser
//

ASN1.ELOOP = "uASN1.js Error: iterated over 15+ elements (probably a malformed file)";
ASN1.EDEEP = "uASN1.js Error: element nested 20+ layers deep (probably a malformed file)";
// Container Types are Sequence 0x30, Octect String 0x04, Array? (0xA0, 0xA1)
// Value Types are Integer 0x02, Bit String 0x03, Null 0x05, Object ID 0x06,
// Sometimes Bit String is used as a container (RSA Pub Spki)
ASN1.VTYPES = [ 0x02, 0x03, 0x05, 0x06, 0x0c, 0x82 ];
ASN1.parse = function parseAsn1(buf, depth, ws) {
  if (!ws) { ws = ''; }
  if (depth >= 20) { throw new Error(ASN1.EDEEP); }

  var index = 2; // we know, at minimum, data starts after type (0) and lengthSize (1)
  var asn1 = { type: buf[0], lengthSize: 0, length: buf[1] };
  var child;
  var iters = 0;
  var adjust = 0;
  var adjustedLen;

  // Determine how many bytes the length uses, and what it is
  if (0x80 & asn1.length) {
    asn1.lengthSize = 0x7f & asn1.length;
    // I think that buf->hex->int solves the problem of Endianness... not sure
    asn1.length = parseInt(Enc.bufToHex(buf.slice(index, index + asn1.lengthSize)), 16);
    index += asn1.lengthSize;
  }

  // High-order bit Integers have a leading 0x00 to signify that they are positive.
  // Bit Streams use the first byte to signify padding, which x.509 doesn't use.
  if (0x00 === buf[index] && (0x02 === asn1.type || 0x03 === asn1.type)) {
    // However, 0x00 on its own is a valid number
    if (asn1.length > 1) {
      index += 1;
      adjust = -1;
    }
  }
  adjustedLen = asn1.length + adjust;

  //console.warn(ws + '0x' + Enc.numToHex(asn1.type), index, 'len:', asn1.length, asn1);

  // this is a primitive value type
  if (-1 !== ASN1.VTYPES.indexOf(asn1.type)) {
    asn1.value = buf.slice(index, index + adjustedLen);
    return asn1;
  }

  asn1.children = [];
  //console.warn('1 len:', (2 + asn1.lengthSize + asn1.length), 'idx:', index, 'clen:', 0);
  while (iters < 15 && index < (2 + asn1.length + asn1.lengthSize)) {
    iters += 1;
    child = ASN1.parse(buf.slice(index, index + adjustedLen), (depth || 0) + 1, ws + '  ');
    // The numbers don't match up exactly and I don't remember why...
    // probably something with adjustedLen or some such, but the tests pass
    index += (2 + child.lengthSize + child.length);
    //console.warn('2 len:', (2 + asn1.lengthSize + asn1.length), 'idx:', index, 'clen:', (2 + child.lengthSize + child.length));
    if (index > (2 + asn1.lengthSize + asn1.length)) {
      console.error(JSON.stringify(asn1, function (k, v) {
        if ('value' === k) { return '0x' + Enc.bufToHex(v.data); } return v;
      }, 2));
      throw new Error("Parse error: child value length (" + child.length
        + ") is greater than remaining parent length (" + (asn1.length - index)
        + " = " + asn1.length + " - " + index + ")");
    }
    asn1.children.push(child);
    //console.warn(ws + '0x' + Enc.numToHex(asn1.type), index, 'len:', asn1.length, asn1);
  }
  if (index !== (2 + asn1.lengthSize + asn1.length)) {
    console.warn('index:', index, 'length:', (2 + asn1.lengthSize + asn1.length))
    throw new Error("premature end-of-file");
  }
  if (iters >= 15) { throw new Error(ASN1.ELOOP); }

  return asn1;
};

/*
ASN1._stringify = function(asn1) {
  //console.log(JSON.stringify(asn1, null, 2));
  //console.log(asn1);
  var ws = '';

  function write(asn1) {
    console.log(ws, 'ch', Enc.numToHex(asn1.type), asn1.length);
    if (!asn1.children) {
      return;
    }
    asn1.children.forEach(function (a) {
      ws += '\t';
      write(a);
      ws = ws.slice(1);
    });
  }
  write(asn1);
};
*/

ASN1.tpl = function (asn1) {
  //console.log(JSON.stringify(asn1, null, 2));
  //console.log(asn1);
  var sp = '  ';
  var ws = sp;
  var i = 0;
  var vars = [];
  var str = ws;

  function write(asn1, k) {
    str += "\n" + ws;
    var val;
    if ('number' !== typeof k) {
      // ignore
    } else {
      str += ', ';
    }
    if (0x02 === asn1.type) {
      str += "ASN1.UInt(";
    } else if (0x03 === asn1.type) {
      str += "ASN1.BitStr(";
    } else {
      str += "ASN1('" + Enc.numToHex(asn1.type) + "'";
    }
    if (!asn1.children) {
      if (0x05 !== asn1.type) {
        if (0x06 !== asn1.type) {
          val = asn1.value || new Uint8Array(0);
          vars.push("\n// 0x" + Enc.numToHex(val.byteLength) + " (" + val.byteLength + " bytes)\nopts.tpl" + i + " = '"
            + Enc.bufToHex(val) + "';");
          if (0x02 !== asn1.type && 0x03 !== asn1.type) {
            str += ", ";
          }
          str += "Enc.bufToHex(opts.tpl" + i + ")";
        } else {
          str += ", '" + Enc.bufToHex(asn1.value) + "'";
        }
      } else {
        console.warn("XXXXXXXXXXXXXXXXXXXXX");
      }
      str += ")";
      return ;
    }
    asn1.children.forEach(function (a, j) {
      i += 1;
      ws += sp;
      write(a, j);
      ws = ws.slice(sp.length);
    });
    str += "\n" + ws + ")";
  }

  write(asn1);
  console.log('var opts = {};');
  console.log(vars.join('\n') + '\n');
  console.log();
  console.log('function buildSchema(opts) {');
  console.log(sp + 'return Enc.hexToBuf(' + str.slice(3) + ');');
  console.log('}');
  console.log();
  console.log('buildSchema(opts);');
};

module.exports = ASN1;
