'use strict';

var app = require('app');
var Menu = require('menu');
var MenuItem = require('menu-item');
var Tray = require('tray');
var dialog = require('dialog');
var exec = require('child_process').exec;

function loadProject() {
  var files = dialog.showOpenDialog({
    properties: [ 'openFile' ],
    title: 'Open Invoker config file'
  });

  if (Array.isArray(files)) {
    exec('invoker start ' + files[0] + ' -d', function(error, stdout, stderr) {
      if (!error) {
        // TODO: update menu
      } else {
        console.log(error);
      }
    });
  }
}

var tray = null;
app.on('ready', function() {
  tray = new Tray(__dirname + '/tray-icon.png');
  tray.setPressedImage(__dirname + '/tray-icon-alt.png');

  var contextMenu = Menu.buildFromTemplate([
    { label: 'Load project', click: loadProject },
    { type: 'separator' },
    { label: 'Quit', click: function() { app.quit(); } }
  ]);
  tray.setContextMenu(contextMenu);

  app.dock.hide();
});
