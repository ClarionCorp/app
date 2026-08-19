// Just a central file to edit constant variables across updates.
// I don't recommend changing this unless you know what you are doing.

export const version = '2.0.0-pre7';
export const ClarionAPI = 'https://api.clarioncorp.net';
export const OdyAPI = 'https://prometheus-proxy.odysseyinteractive.gg/api';
export const AiMiAPI = 'https://api.aimis.app';
// export const AiMiAPI = 'http://localhost:12240';
export const StatusUrl = 'https://status.blals.com';

// Proton Paths
export const proton_root = '.steam/steam/steamapps/compatdata/1869590/pfx/drive_c/'; // prefix
export const proton_temp = `${proton_root}/users/steamuser/AppData/Local/Temp/`;

// Default game install locations, used to auto-detect the game dir without prompting the user.
export const windows_default_gamedir = 'C:/Program Files (x86)/Steam/steamapps/common/OmegaStrikers';
export const linux_default_gamedir = '.steam/steam/steamapps/common/OmegaStrikers';

// Identity Path Suffix (after user home folder)
export const windows_identity = 'AppData/Local/OmegaStrikers/identity.json';
export const linux_identity = `${proton_root}/users/steamuser/AppData/Local/OmegaStrikers/identity.json`;

// Log File Path (after user home folder)
export const windows_log = 'AppData/Local/OmegaStrikers/Saved/Logs/OmegaStrikers.log';
export const linux_log = `${proton_root}/users/steamuser/AppData/Local/OmegaStrikers/Saved/Logs/OmegaStrikers.log`;

// Steam launch option needed on Linux/Proton so UE4SS's dwmapi.dll proxy actually gets loaded
export const linux_launch_options = 'WINEDLLOVERRIDES="dwmapi=n,b" %command%';

// How often to heartbeat-check that the active identity hasn't changed (ms)
export const heartbeat_interval = 300_000;