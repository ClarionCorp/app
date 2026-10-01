local ModName = "AiMiApp"
local ModVersion = "1.4.4"

print(string.format("\n=== %s v%s Loaded ===\n", ModName, ModVersion))

local OUT_DIR = os.getenv("TEMP") .. "\\AiMiApp"
print(string.format("[%s] Writing output to: %s\n", ModName, OUT_DIR))
pcall(function() os.execute('mkdir "' .. OUT_DIR .. '"') end)

-- Replaces GameSessionMod and GameStateMod
-- (also contains custom lobby stuff for now)
-- Writes meta.json in place.
local Meta = require("Meta")
Meta.Init(ModName, OUT_DIR)

-- Replaces PlayerFinderMod: live player roster
-- Writes players.json in place.
local Players = require("Players")
Players.Init(ModName, OUT_DIR)

-- Replaces the score/set/map/ban half of GameStateMod's snapshot
-- Writes match.json in place.
local Match = require("Match")
Match.Init(ModName, OUT_DIR)

-- Replaces PostGameStatsMod: end-of-match stat line + MVP
-- Writes postgame.json in place.
local PostGame = require("PostGame")
PostGame.Init(ModName, OUT_DIR)

-- Writes heartbeat.json in place, once on load and every minute after.
local Heartbeat = require("Heartbeat")
Heartbeat.Init(ModName, OUT_DIR)
