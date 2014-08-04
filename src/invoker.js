'use strict';

var exec = require('child_process').exec;
var net = require('net');

var INITIAL_PACKET_SIZE = 9;

function lpad(str, length, padStr) {
  padStr = padStr || '0';
  str = str + '';
  return str.length >= length ? str : new Array(length - str.length + 1).join(padStr) + str;
}

function encodedMessage(messageObject) {
  var json = JSON.stringify(messageObject);
  var lengthStr = lpad(json.length, INITIAL_PACKET_SIZE);
  return lengthStr + json;
}

function sendCommand(message, cb) {
  var client = net.connect('/tmp/invoker', function() {
    console.log('client connected');
    client.write(message);
  });

  client.on('end', function() {
    console.log('client disconnected');
  });

  client.on('error', function() {
    console.log('error', arguments);
  });

  client.on('data', function(data) {
    var data = data.toString().slice(INITIAL_PACKET_SIZE);
    return cb(data);
  });
}

exports.start = function(configFile, cb) {
  exec('invoker start ' + configFile + ' -d', function(error, stdout, stderr) {
    if (!error) {
      return cb();
    } else {
      return cb(error);
    }
  });
};

exports.list = function(cb) {
  var messageObject = { type: 'list' };
  var message = encodedMessage(messageObject);
  sendCommand(message, cb);
};
