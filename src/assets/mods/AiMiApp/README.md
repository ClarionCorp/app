# UE4SS Worker Mod (AiMiApp)

This is an all-in-one version of the mod with modules for different tasks.

| Module        | Task                                                          | Formerly                      |
| ------------- | ------------------------------------------------------------- | ----------------------------- |
| main.lua      | Orchestrator                                                  | —                             |
| Meta.lua      | Anything out of a match. Party, GameState, Custom Lobby, etc. | GameStateMod & GameSessionMod |
| Match.lua     | Match Settings/Score. (bans, map, duration, etc.)             | GameStateMod                  |
| Players.lua   | All Match Players. Usernames, character, xp, trainings, etc.  | PlayerFinderMod               |
| PostGame.lua  | Just gathers and formats the Post Match Summary page.         | PostGameStatsMod              |
| Heartbeat.lua | Polls every minute and inserts a timestamp for it. (No hooks) | —                             |

## Limitations
Working with UE4SS has been... interesting. There is no async calls, so we need to heavily cache and only do medium to large functions when absolutely necessary.
This is because each thing we do is run inline with the game, so we are racing frametimes.

Below is a basic table outlining the max time we have to compute before FPS starts dropping.

| Framerate | Frametime |
| --------- | --------- |
| 60 FPS    | 16.6ms    |
| 120 FPS   | 8.3ms     |
| 144 FPS   | 6.9ms     |
| 165 FPS   | 6.0ms     |
| 240 FPS   | 4.2ms     |
| 360 FPS   | 2.7ms     |
| 480 FPS   | 2.0ms     |

Unfortunately, using `print` to write to the `UE4SS.log` file is also synchronous, and can cause huge frame drops *(upwards of 28ms!)* if used during a busy time/hook. (so use sparingly)

## Finding Types / Development
In `UE4SS-settings.ini` there is a line to enable the debug console.
```ini
GuiConsoleEnabled = 1
GuiConsoleVisible = 1
GraphicsAPI = opengl ; Change to "dx11" if window is just white
```

After that, you can `Generate Lua Types`. This will make a folder in `Win64\Mods\shared\types\`. In there is a bunch of stuff, but the most useful is `Prometheus.lua` and `Prometheus_enums.lua`. These are how we know how to use all the built-in hooks and functions.

This debug GUI is also very helpful for reloading mods without restarting the game each time.