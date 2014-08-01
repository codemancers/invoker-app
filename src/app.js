'use strict';

var app = require('app');
var Menu = require('menu');
var MenuItem = require('menu-item');
var Tray = require('tray');

var tray = null;
app.on('ready', function() {
  tray = new Tray(__dirname + '/tray-icon.png');
  tray.setPressedImage(__dirname + '/tray-icon-alt.png');

  var contextMenu = Menu.buildFromTemplate([
    { label: 'Quit', click: function() { app.quit(); } }
  ]);
  tray.setContextMenu(contextMenu);

  app.dock.hide();
});
