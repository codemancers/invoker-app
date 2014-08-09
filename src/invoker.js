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

function sendMessage(message, callback) {
  var client = net.connect(SOCKET_PATH, function() {
    console.log('client connected');
    console.log('sending message', message);
    client.write(message);
  });

  client.on('end', function() {
    console.log('client disconnected');
  });

  client.on('error', function(error) {
    console.log(error);
    if (callback) {
      callback(error);
    }
  });

  client.on('data', function(data) {
    var data = data.toString().slice(INITIAL_PACKET_SIZE);
    if (callback) {
      callback(null, data);
    }
  });
}

exports.start = function(configFile, callback) {
  exec('invoker start ' + configFile + ' -d', function(error, stdout, stderr) {
    callback(error, stdout, stderr);
  });
};

exports.stop = function(callback) {
  exec('invoker stop', function(error, stdout, stderr) {
    callback(error, stdout, stderr);
  });
};

exports.list = function(callback) {
  var messageObject = { type: 'list' };
  var message = encodedMessage(messageObject);
  sendMessage(message, callback);
};

exports.reload = function(processName) {
  var messageObject = {
    process_name: processName,
    signal: 'INT',
    type: 'reload'
  };
  var message = encodedMessage(messageObject);
  sendMessage(message);
};

exports.add = function(processName) {
  var messageObject = {
    process_name: processName,
    signal: 'INT',
    type: 'add'
  };
  var message = encodedMessage(messageObject);
  sendMessage(message);
};

exports.remove = function(processName) {
  var messageObject = {
    process_name: processName,
    signal: 'INT',
    type: 'remove'
  };
  var message = encodedMessage(messageObject);
  sendMessage(message);
};
