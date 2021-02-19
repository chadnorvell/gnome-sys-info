'use strict'

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;

const Clutter = imports.gi.Clutter;
const Config = imports.misc.config;
const ExtensionUtils = imports.misc.extensionUtils;
const Lang = imports.lang;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const PanelMenu = imports.ui.panelMenu;
const St = imports.gi.St;

const REFRESH_PERIOD = 5
const SHELL_MINOR = parseInt(Config.PACKAGE_VERSION.split('.')[1]);

const Me = ExtensionUtils.getCurrentExtension();

let label = null
let indicator = null;

let SystemInformation = class SystemInformation extends PanelMenu.Button {
  _init() {
    super._init(0.0, `${Me.metadata.name} Indicator`, false);

    label = new St.Label({
      text: sys_info_string(),
      y_align: Clutter.ActorAlign.CENTER,
      style_class: 'sys-info-label'
    });

    this.add_child(label);
    this._update();
  }

  _update() {
    label.set_text(sys_info_string());
    Mainloop.timeout_add_seconds(REFRESH_PERIOD, Lang.bind(this, this._update));
  }
}

if (SHELL_MINOR > 30) {
  SystemInformation = GObject.registerClass(
    {GTypeName: "SystemInformation"},
    SystemInformation
  );
}

function cpu_load_average() {
  const [res, out] = GLib.spawn_command_line_sync("uptime");

  if(!res) {
    log("Failed to get uptime output");
    return "no data";
  } else {
    const load_avg = out.toString().match(/(\d*\.\d*), (\d*\.\d*), (\d*\.\d*)/)[0];

    if(load_avg === null) {
      log("Failed to parse uptime output");
      return "no data";
    } else {
      return load_avg;
    }
  }
}

function mem_usage() {
  const [res, out] = GLib.spawn_command_line_sync("cat /proc/meminfo");

  if(!res) {
    log("Failed to get /proc/meminfo output");
    return "no data";
  } else {
    const outString = out.toString()
    const memTotal = outString.match(/MemTotal:\s*(\d+)/);
    const memFree = outString.match(/MemFree:\s*(\d+)/);
    const buffers = outString.match(/Buffers:\s*(\d+)/);
    const cached = outString.match(/Cached:\s*(\d+)/);

    if([memTotal, memFree, buffers, cached].some(m => m === null)) {
      log("Failed to parse /proc/meminfo output");
      return "no data";
    } else {
      const memReallyFree = parseInt(memFree[1]) + parseInt(buffers[1]) + parseInt(cached[1]);
      const memUsed = parseInt(memTotal[1]) - memReallyFree;
      return (memUsed / (1024 ** 2)).toFixed(2) + "G";
    }
  }
}

function sys_info_string() {
  return `CPU: ${cpu_load_average()}  RAM: ${mem_usage()}`;
}

function init() {
  log(`Enabling ${Me.metadata.name} version ${Me.metadata.version}`);
}

function enable() {
  indicator = new SystemInformation();
  log(`Enabling ${Me.metadata.name} version ${Me.metadata.version}`);
  Main.panel.addToStatusArea(Me.metadata.name.toString(), indicator);
}

function disable() {
  log(`Disabling ${Me.metadata.name} version ${Me.metadata.version}`);

  if(indicator !== null) {
    indicator.destroy();
    indicator = null;
  }
}
