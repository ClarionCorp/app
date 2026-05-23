![Ai.Mi App](/public/typeface.png)

The **Ai.Mi App** is a companion app that runs alongside **[Omega Strikers](https://www.odysseyinteractive.gg/omegastrikers)**. It is developed right here on GitHub by the makers of **[ClarionCorp](https://clarioncorp.net)**, a stats tracking database for Omega Strikers.


The goal is to provide you with additional insight into your game. Though keep in mind, it is __NOT__ intended to give players an unfair advantage, just nice-to-haves (QoL).

# Features

## Live Match Summary
  - Automatically fetch the rank of your opponents
  - Track awakening pool and current selections

The live match summary will automatically fetch the Name, Character, Rating, Rank, and WinRate of every player in the game. It will also show what awakenings are currently in rotation, and which ones have already been selected or shown.


## Instant Match History
The app will automatically save completed games and be viewable completely in-app. This process only takes a couple of seconds after a match has finalized, and is much more detailed than its online counterparts.

<!-- Add comparison graph here at some point -->

## Mod Manager (planned)
No more fussing around with manually keeping track of your pak files. With this, you can view your currently installed mods, as well as download new ones straight from [GameBanana](https://gamebanana.com/games/17234).

## Local Custom Game Manager (planned)
Custom Game Manager is a tool currently hosted on [ClarionCorp](https://clarioncorp.net/custom-games). Though, prepping the Auth file can be annoying, so we're bringing CGM to the Ai.Mi App to do it all automatically!

## Custom Queue Manager (planned)
Explore other queues that are available in the game for some reason. We also may work with Event Organizers to introduce custom queues or matchmaking.

---
# Notices

## UE4SS Modding Framework
v2 was built from the ground up to rely heavily on custom UE4SS mods that hook into the game directly. Upon launching the app, it will check for UE4SS and current mod versions. If UE4SS is undetected or outdated, it will automatically install a very minimized version of UE4SS to the game's directory.

If that doesn't sit right with you, do not use this app. This game doesn't have an anti-cheat, so none of this should get you banned or anything. :shrug:

## Small Memory Footprint
Built with Tauri, the Ai.Mi App uses just less than 10 MB of RAM currently. The package size is around 50 MB, but most of that is images used inside the app. Some images are retrieved from the cloud to minimize this footprint.

---

# Installation / Uninstallation
During pre-release development, only standalone versions of the app will be shipped. So, just download it and run it, really. For releases, you can either download the standalone, or if you want automatic updates you can download the installer (setup). All downloads can be found in [releases](https://github.com/ClarionCorp/app/releases).

If you wish to uninstall, just run the windows uninstaller. (Search `Add or Remove Programs` in Windows Search)

Keep in mind that if you uninstall the App (or decide to stop using it), UE4SS will continue to be installed. We plan on adding an "Uninstall UE4SS" button in the future, but until then, you can always uninstall it manually like so:

1. Open your Steam Library and navigate to Omega Strikers.
2. Right-Click it on the left-list, hover `Manage`, and click `Browse Local Files`.
3. In the Explorer window, open the `OmegaStrikers` folder.
4. Then open `Binaries`, then `Win64`.
5. In this folder, delete the following files:
   - imgui.ini
   - UE4SS.dll
   - UE4SS-settings.ini
   - dwmapi.dll
   - Changelog.md
   - README.md
   - Mods (folder)
6. Once all of those are gone, UE4SS will be completely uninstalled.

---

# Help & Support
The [Official ClarionCorp Discord](https://clarioncorp.net/discord) is probably the best way to reach us. Don't hesitate to tag @blals in any OS-related Discord Server though.

For Bug Reports, either create a forum post on the CC Discord (in the bugs channel), or create a new [issue](https://github.com/ClarionCorp/app/issues) on GitHub. Currently, I am just one man working on this for free, so there is no roadmap and some bugs may take a while to get fixed. :pray: