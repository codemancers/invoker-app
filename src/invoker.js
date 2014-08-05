'use strict';

var exec = require('child_process').exec;
var net = require('net');

var INITIAL_PACKET_SIZE = 9;
var SOCKET_PATH = '/tmp/invoker';

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

function sendCommand(message, callback) {
  var client = net.connect(SOCKET_PATH, function() {
    console.log('client connected');
    client.write(message);
  });

  client.on('end', function() {
    console.log('client disconnected');
  });

  client.on('error', function(error) {
    console.log(error);
    callback(error);
  });

  client.on('data', function(data) {
    var data = data.toString().slice(INITIAL_PACKET_SIZE);
    callback(null, data);
  });
}

exports.start = function(configFile, callback) {
  exec('invoker start ' + configFile + ' -d', function(error, stdout, stderr) {
    callback(error, stdout, stderr);
  });
};

exports.list = function(callback) {
  var messageObject = { type: 'list' };
  var message = encodedMessage(messageObject);
  sendCommand(message, callback);
};
