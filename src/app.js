'use strict';

var app = require('app');
var Menu = require('menu');
var MenuItem = require('menu-item');
var Tray = require('tray');
var dialog = require('dialog');
var invoker = require('./invoker');

app.dock.hide();

function loadProject() {
  var files = dialog.showOpenDialog({
    properties: ['openFile'],
    title: 'Open Invoker config file'
  });

  if (Array.isArray(files)) {
    invoker.start(files[0], function(error) {
      if (!error) {
        invoker.list(updateMenu);
      } else {
        console.log(error);
      }
    });
  }
}

function updateMenu(data) {
  var processes;

  if (data) {
    processes = JSON.parse(data).processes;
  }

  var template = [{
    label: 'Load project',
    click: loadProject
  }];

  if (processes && processes.length > 0) {
    template.push({
      type: 'separator'
    });

    processes.forEach(function(process) {
      template.push({
        label: process.process_name,
        submenu: [{
          label: 'Reload'
        }, {
          label: 'Remove'
        }]
      });
    });
  }

  template.push({
    type: 'separator'
  }, {
    label: 'Quit',
    click: app.quit
  });

  var contextMenu = Menu.buildFromTemplate(template);
  tray.setContextMenu(contextMenu);
}

var tray = null;
app.on('ready', function() {
  tray = new Tray(__dirname + '/tray-icon.png');
  tray.setPressedImage(__dirname + '/tray-icon-alt.png');

  updateMenu();
});
