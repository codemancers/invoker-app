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
var currentProcesses = null;

if (app.dock) {
  app.dock.hide();
}

// fix the $PATH on OS X
// OS X doesn't read .bashrc/.zshrc for GUI apps
// Ripped from gulp-app
if (process.platform === 'darwin') {
  process.env.PATH += ':/usr/local/bin';
  process.env.PATH += ':' + process.env.HOME + '/.rbenv/shims';
}

function loadProject() {
  var files = dialog.showOpenDialog({
    properties: ['openFile'],
    title: 'Open Invoker config file'
  });

  if (Array.isArray(files)) {
    invoker.start(files[0], function(error, stdout, stderr) {
      if (!error) {
        console.log('invoker started');
      } else {
        console.log(error);
      }
    });
  }
}

function stop() {
  invoker.stop(function(error) {
    if (!error) {
      console.log('invoker stopped');
    } else {
      console.log(error);
    }
  });
}

function updateTrayMenu() {
  setTimeout(updateTrayMenu, TRAY_UPDATE_INTERVAL);

  invoker.list(function(error, data) {
    var processes = null;

    if (!error) {
      processes = JSON.parse(data).processes;
      tray.setImage(__dirname + '/tray-icon.png')
    } else {
      tray.setImage(__dirname + '/tray-icon-inactive.png')
    }

    var template = [{
      label: 'Load project',
      click: loadProject,
      enabled: !!error
    }];

    if (_.isEqual(currentProcesses, processes) && processes !== null) {
      return;
    }

    if (processes && processes.length > 0) {
      currentProcesses = processes;

      template.push({
        label: 'Stop',
        click: stop
      },{
        type: 'separator'
      });

      processes.forEach(function(process) {
        template.push({
          label: process.process_name,
          submenu: createSubmenu(process)
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
  });
}

function createSubmenu(process) {
  var submenu = [];

  if (process.pid) {
    submenu.push({
      label: 'Reload',
      click: function() {
        invoker.reload(process.process_name);
      }
    }, {
      label: 'Remove',
      click: function() {
        invoker.remove(process.process_name);
      }
    });
  } else {
    submenu.push({
      label: 'Add',
      click: function() {
        invoker.add(process.process_name);
      }
    }, {
      label: 'Reload',
      enabled: false
    });
  }

  return submenu;
}

app.on('ready', function() {
  tray = new Tray(__dirname + '/tray-icon.png');
  tray.setPressedImage(__dirname + '/tray-icon-alt.png');
  tray.setToolTip('invoker-app');

  updateTrayMenu();
});
