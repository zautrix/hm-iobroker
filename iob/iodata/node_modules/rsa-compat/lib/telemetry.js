'use strict';

// We believe in a proactive approach to sustainable open source.
// As part of that we make it easy for you to opt-in to following our progress
// and we also stay up-to-date on telemetry such as operating system and node
// version so that we can focus our efforts where they'll have the greatest impact.
//
// Want to learn more about our Terms, Privacy Policy, and Mission?
// Check out https://therootcompany.com/legal/

var os = require('os');
var crypto = require('crypto');
var https = require('https');
var pkg = require('../package.json');

// to help focus our efforts in the right places
var data = {
  package: pkg.name
, version: pkg.version
, node: process.version
, arch: process.arch || os.arch()
, platform: process.platform || os.platform()
, release: os.release()
};

function addCommunityMember(opts) {
  setTimeout(function () {
    var req = https.request({
      hostname: 'api.therootcompany.com'
    , port: 443
    , path: '/api/therootcompany.com/public/community'
    , method: 'POST'
    , headers: { 'Content-Type': 'application/json' }
    }, function (resp) {
      // let the data flow, so we can ignore it
      resp.on('data', function () {});
      //resp.on('data', function (chunk) { console.log(chunk.toString()); });
      resp.on('error', function () { /*ignore*/ });
      //resp.on('error', function (err) { console.error(err); });
    });
    var obj = JSON.parse(JSON.stringify(data));
    obj.action = 'updates';
    try {
      obj.ppid = ppid(obj.action);
    } catch(e) {
      // ignore
      //console.error(e);
    }
    obj.name = opts.name || undefined;
    obj.address = opts.email;
    obj.community = 'node.js@therootcompany.com';

    req.write(JSON.stringify(obj, 2, null));
    req.end();
    req.on('error', function () { /*ignore*/ });
    //req.on('error', function (err) { console.error(err); });
  }, 50);
}

function ping(action) {
  setTimeout(function () {
    var req = https.request({
      hostname: 'api.therootcompany.com'
    , port: 443
    , path: '/api/therootcompany.com/public/ping'
    , method: 'POST'
    , headers: { 'Content-Type': 'application/json' }
    }, function (resp) {
      // let the data flow, so we can ignore it
      resp.on('data', function () { });
      //resp.on('data', function (chunk) { console.log(chunk.toString()); });
      resp.on('error', function () { /*ignore*/ });
      //resp.on('error', function (err) { console.error(err); });
    });
    var obj = JSON.parse(JSON.stringify(data));
    obj.action = action;
    try {
      obj.ppid = ppid(obj.action);
    } catch(e) {
      // ignore
      //console.error(e);
    }

    req.write(JSON.stringify(obj, 2, null));
    req.end();
    req.on('error', function (/*e*/) { /*console.error('req.error', e);*/ });
  }, 50);
}

// to help identify unique installs without getting
// the personally identifiable info that we don't want
function ppid(action) {
  var parts = [ action, data.package, data.version, data.node, data.arch, data.platform, data.release ];
  var ifaces = os.networkInterfaces();
  Object.keys(ifaces).forEach(function (ifname) {
    if (/^en/.test(ifname) || /^eth/.test(ifname) || /^wl/.test(ifname)) {
      if  (ifaces[ifname] && ifaces[ifname].length) {
        parts.push(ifaces[ifname][0].mac);
      }
    }
  });
  return crypto.createHash('sha1').update(parts.join(',')).digest('base64');
}

module.exports.ping = ping;
module.exports.joinCommunity = addCommunityMember;

if (require.main === module) {
  ping('install');
  //addCommunityMember({ name: "AJ ONeal", email: 'coolaj86@gmail.com' });
}
