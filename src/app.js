'use strict';

var app = require('app');
var Menu = require('menu');
var MenuItem = require('menu-item');
var Tray = require('tray');
var dialog = require('dialog');
var _ = require('underscore');

var invoker = require('./invoker');

var tray;
var TRAY_UPDATE_INTERVAL = 5000;

app.dock.hide();

function loadProject() {
  var files = dialog.showOpenDialog({
    properties: ['openFile'],
    title: 'Open Invoker config file'
  });

  if (Array.isArray(files)) {
    invoker.start(files[0], function(error, stdout, stderr) {
      if (error) {
        console.log('Error starting invoker', error);
      }
    });
  }
}

var currentProcesses = null;

function updateTrayMenu() {
  setTimeout(updateTrayMenu, TRAY_UPDATE_INTERVAL);

  invoker.list(function(error, data) {
    var processes = null;

    if (data) {
      processes = JSON.parse(data).processes;
    }

    var template = [{
      label: 'Load project',
      click: loadProject
    }];

    if (_.isEqual(currentProcesses, processes) && processes !== null) {
      return;
    }

    if (processes && processes.length > 0) {
      currentProcesses = processes;

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
      sublabel: 'skjdfkldjsf',
      click: app.quit
    });

    var contextMenu = Menu.buildFromTemplate(template);
    tray.setContextMenu(contextMenu);
  });
}

app.on('ready', function() {
  tray = new Tray(__dirname + '/tray-icon.png');
  tray.setPressedImage(__dirname + '/tray-icon-alt.png');

  updateTrayMenu();
});
