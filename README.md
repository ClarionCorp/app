![Ai.Mi App](/public/typeface.png)

The **Ai.Mi App** is a companion app that runs alongside **[Omega Strikers](https://www.odysseyinteractive.gg/omegastrikers)**. It is developed right here on GitHub by the makers of **[ClarionCorp](https://clarioncorp.net)**, a stats tracking database for Omega Strikers.


The goal is to provide you with additional insight into your game. Though keep in mind, it is **NOT** intended to give players an unfair advantage, just nice-to-haves (QoL).

[![Download](/public/download.png)](https://github.com/ClarionCorp/app/wiki)

---
# Features

## 🏅 Live Match Summary
  - Automatically fetch detailed stats of all players
  - Track awakening pool and current selections
  - Track XP earned per set, per goal, and per match
  - Predict awakening pick order before intermission
  - Show possible smurfs using simple prediction logic
  - Works in all modes (Normal, Ranked, Custom)
  - Can be disabled by hosts for tournaments


<!-- Add updated preview image later -->

## 📃 Instant Match History
The app will automatically save completed games and be viewable completely in-app. This process only takes a couple of seconds after a match has finalized, and is much more detailed than its online counterparts. Soon, completed matches will be viewable on ClarionCorp too.

|               | **Ai.Mi App** | **[ClarionCorp](https://clarioncorp.net/)** | **[Omega Stats](https://stats.omegastrikers.gg/)** |
| ------------- | ------------- | ------------------------------------------- | -------------------------------------------------- |
| Map           | ✅             | ✅                                           | ✅                                                  |
| Duration      | ✅             | ✅                                           | ✅                                                  |
| Average Rank  | ✅             | ✅                                           | ✅                                                  |
| Bans          | ✅             | ✅                                           | ✅                                                  |
|               |               |                                             |                                                    |
| Character     | ✅             | ✅                                           | ✅                                                  |
| Rank          | ✅             | ❌                                           | ❌                                                  |
| Username      | ✅             | ✅                                           | ❌                                                  |
|               |               |                                             |                                                    |
| Role          | ✅             | ✅                                           | ✅                                                  |
| MVP           | ✅             | ✅                                           | ✅                                                  |
| Level         | ✅             | ✅                                           | ✅                                                  |
| Scores        | ✅             | ✅                                           | ✅                                                  |
| Assists       | ✅             | ✅                                           | ✅                                                  |
| Saves         | ✅             | ✅                                           | ✅                                                  |
| Knockouts     | ✅             | ✅                                           | ✅                                                  |
| Damage        | ✅             | ❌                                           | ❌                                                  |
| Shots         | ✅             | ❌                                           | ❌                                                  |
| Redirects     | ✅             | ❌                                           | ❌                                                  |
| Orbs          | ✅             | ❌                                           | ❌                                                  |
| Starting Gear | ✅             | ✅                                           | ✅                                                  |
| Awakenings    | ✅             | ✅                                           | ✅                                                  |
|               |               |                                             |                                                    |
| ALL Modes     | ✅             | ❌                                           | ❌                                                  |

## 🗣️ Discord Rich Presence
The default OS Rich Presence kind of sucks. Just says you're playing OS and for how long. Our custom Rich Presence is fully dynamic based on what you are doing. Whether it's queuing, playing (live score!), or just sitting in the lobby, your friends on discord will be updated on it!

![Discord RPC](https://clarioncorp.net/i/app/Discord-RPC.png)

## 👥 Online Player Counter
Everyone using the app will have their gamestate periodically sent to the Ai.Mi API. Additionally, whenever you finish up a match, it is automatically sent to the helper API for processing. Once processed, all seen players will be accounted for and added to the total player count. (they expire if not seen again for an hour)


## 🌿 Quality of Life
- Queue Pop SFX: Play a sound when your queue pops to let you know to stop playing Risk of Rain 2 and tab back in.
- Stream Overlay: Show app stats and/or queue state with customizable widgets on your stream. (fully local)
- Theme Support: Pick from one of many pre-made themes, or make your own and have it added to the app.
- Auto Open Game: Optionally ask the app to auto open OS via Steam when the app is launched.
- Close with Game: Optionally ask the app to close itself when the game shuts down.
- Match History Viewer: Sort and Filter Match History by **Queue**, **Map**, **Character**, **Account**, and **Players**.

## 🔎 Mod Manager (planned)
No more fussing around with manually keeping track of your pak files. With this, you can view your currently installed mods, as well as download new ones straight from [GameBanana](https://gamebanana.com/games/17234).


## ⚙️ Local Custom Game Manager (planned)
Custom Game Manager is a tool currently hosted on [ClarionCorp](https://clarioncorp.net/custom-games). Though, prepping the Auth file can be annoying, so we're bringing CGM to the Ai.Mi App to do it all automatically!


## 🖥️ Custom Queue Manager (planned)
Explore other queues that are available in the game for some reason. We also may work with Event Organizers to introduce custom queues or matchmaking.

---
# Notices

## 🔧 UE4SS Modding Framework
v2 was built from the ground up to rely heavily on a custom UE4SS mod that hooks into the game directly. Upon launching the app, it will check for UE4SS and the current mod version. If UE4SS is undetected or outdated, it will automatically install it to the game's directory.

If that doesn't sit right with you, do not use this app. OS doesn't have an anti-cheat, so none of the mods will get you banned.

## 🤏 Small Footprint
Built with Tauri, the Ai.Mi App uses just less than 10 MB of RAM currently. The package size is around 100 MB, but most of that is images used inside the app. Some images are retrieved from the cloud to minimize this footprint.

The UE4SS Mod has also been rigorously optimized several times to minimize the impact it has on performance. Unfortunately, there will always be *some* impact, since we cannot run hooks async from the game. Alas the performance difference should be virtually unnoticeable.

## ⚠️ Privacy Notice
This app occasionally sends data to the ClarionCorp/AppAPI for processing. This includes, but is not limited to:
- Username
- GameState
- App Version
- Entire Matches

This data is then processed for services like "Online Players", "Match History" on CC, and basic analytics like total monthly, active users.

Additionally, the following is automatically included when sending bug reports:
- Discord ID (only if linked to OS account)
- Operating System
- Resolved File Paths (GameDir, Temp, etc.)
- File names in `OmegaStrikers\Binaries\Win64`
- Latest transcript of the app log

We explicitly **do not**:
- Link alt accounts together with this data
- Sell anything or give it to advertisers
- Read any unnecessary files (you can view all permissions [here](https://github.com/ClarionCorp/app/blob/v2-stable/src-tauri/capabilities/default.json))

---

# ✉️ Help & Support
The [Official ClarionCorp Discord](https://clarioncorp.net/discord) is probably the best way to reach us. Don't hesitate to tag @blals in any OS-related Discord Server though.

For Bug Reports, either create a forum post on the CC Discord (in the bugs channel), or create a new [issue](https://github.com/ClarionCorp/app/issues) on GitHub. Currently, I am just one man working on this for free, so there is no public roadmap and some bugs may take a while to get fixed. :pray: