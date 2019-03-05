'use strict';

var fs = require('fs');
var sfs = require('safe-replace').create();

function snakeCase(key) {
  // TODO let user supply list of exceptions
  if ('tlsSni01Port' === key) {
    return 'tls_sni_01_port';
  }
  /*
  else if ('http01Port' === key) {
    return 'http01-port';
  }
  */
  else {
    return key.replace(/([A-Z])/g, '_$1').toLowerCase();
  }
}

function uc(match, c) {
  return c.toUpperCase();
}

function camelCase(key) {
  return key.replace(/_([a-z0-9])/g, uc);
}

function parsePythonConf(str, cb) {
  var keys = {};
  var obj = {};
  var lines = str.split('\n');

  lines.forEach(function (line, i) {
    line = line.replace(/#.*/, '').trim();

    if (!line) { return; }

    var parts = line.split('=');
    var pykey = parts.shift().trim();
    var key = camelCase(pykey);
    var val = parts.join('=').trim();

    if ('True' === val) {
      val = true;
    }
    else if ('False' === val) {
      val = false;
    }
    else if ('None' === val || '' === val) {
      val = null;
    }
    else if (/,/.test(val) && !/^"[^"]*"$/.test(val)) {
      val = val.split(',').map(function(x) { return x.trim(); });
    }
    else if (/^-?[0-9]+$/.test(val)) {
      val = parseInt(val, 10);
    }

    obj[key] = val;
    if ('undefined' !== typeof keys[key]) {
      console.warn("unexpected duplicate key '" + key + "': '" + val + "'");
    }

    keys[key] = i;
  });

  // we want to be able to rewrite the file with comments, etc
  obj.__keys = keys;
  obj.__lines = lines;

  cb(null, obj);
}

function toPyVal(val) {
  if (null === val || '' === val) {
    return 'None';
  }
  else if (true === val) {
    return 'True';
  }
  else if (false === val) {
    return 'False';
  }
  else if ('string' === typeof val) {
    return val;
  }
  else if ('number' === typeof val) {
    return val;
  }
  else if (Array.isArray(val)) {
    val = val.join(',');
    if (-1 === val.indexOf(',')) {
      val += ','; // disambiguates value from array with one element
    }
    return val;
  }

  return val && JSON.stringify(val);
}

function stringifyPythonConf(obj, cb) {
  var endline;

  // nix the final newline
  if (!obj.__lines[obj.__lines.length - 1].trim()) {
    endline = obj.__lines.pop();
  }

  Object.keys(obj).forEach(function (key) {
    if ('__' === key.slice(0, 2)) {
      return;
    }

    var pykey = snakeCase(key);
    var pyval = toPyVal(obj[key]);
    var num = obj.__keys[key];
    var comment = '';

    if ('undefined' === typeof pyval) {
      if ('number' === typeof num) {
        pyval = 'None';
      } else {
        return;
      }
    }

    if ('number' !== typeof num) {
      obj.__lines.push(pykey + ' = ' + pyval);
      obj.__keys[key] = obj.__lines.length - 1;
      return;
    }

    if ('[' === pykey[0]) {
      return;
    }

    if (!obj.__lines[num] || !obj.__lines[num].indexOf) {
      console.warn('[pyconf] WARN index past array length:');
      console.log(obj.__lines.length, num, obj.__lines[num]);
      return;
    }

    // restore comments
    if (-1 !== obj.__lines[num].indexOf('#')) {
      comment = obj.__lines[num].replace(/.*?(\s*#.*)/, '$1');
    }

    obj.__lines[num] = pykey + ' = ' + pyval + comment;
  });

  if ('string' === typeof endline) {
    obj.__lines.push(endline);
  }

  cb(null, obj.__lines.join('\n'));
}

function writePythonConfFile(pathname, obj, cb) {
  // TODO re-read file?
  stringifyPythonConf(obj, function (err, text) {
    sfs.writeFileAsync(pathname, text, 'utf8').then(function () {
      cb(null, null);
    }, function (err) {
      cb(err);
    });
  });
}

function parsePythonConfFile(pathname, cb) {
  fs.readFile(pathname, 'utf8', function (err, text) {
    if (err) {
      cb(err);
      return;
    }

    parsePythonConf(text, cb);
  });
}

module.exports.parse = parsePythonConf;
module.exports.readFile = parsePythonConfFile;
module.exports.stringify = stringifyPythonConf;
module.exports.writeFile = writePythonConfFile;
