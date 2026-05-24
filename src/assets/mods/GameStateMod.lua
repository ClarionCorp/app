local ModName = "GameStateMod"
local ModVersion = "1.3.0"

print(string.format("\n=== %s v%s Loaded ===\n", ModName, ModVersion))

local STATE_FILE = os.getenv("TEMP") .. "\\ue4ss_gamestate.json"
print(string.format("[%s] Writing state to: %s", ModName, STATE_FILE))

local MatchPhaseNames = {
    [0]="None",[1]="PreGame",[2]="CharacterSelect",[3]="FaceOffIntro",[4]="FaceOffCountdown",
    [5]="InGame",[6]="GoalCelebration",[7]="GoalScore",[8]="IntermissionIntro",[9]="Intermission",
    [10]="IntermissionOutro",[11]="PostGameCelebration",[12]="ArenaOverview",[13]="PostGameSummary",
    [14]="EndGame",[15]="LoadoutSelect",[16]="BoostSelect",[17]="TimeoutCelebration",
    [18]="VersusScreen",[19]="BanSelect",[20]="CharacterPreSelect",[21]="BanCelebration",[22]="IntermissionMvp",
}

local LastState = {}
local CapturedQueueId = nil

local function GetLocalTeam()
    local PC = FindFirstOf("PMPlayerControllerGame")
    if PC and PC:IsValid() and PC.PlayerState and PC.PlayerState:IsValid() then
        local team = PC.PlayerState.AssignedTeam
        if team == 1 or team == 2 then return team end
    end
    return nil
end

local function GetMatchStartTime(gs)
    local ok, ts = pcall(function()
        local ticks = gs.MatchEventLog.UtcMatchStartTimestamp.Ticks
        if not ticks or ticks == 0 then return nil end
        -- FDateTime ticks: 100ns intervals since 0001-01-01 -> Unix seconds
        return math.floor(ticks / 10000000) - 62135596800
    end)
    return ok and ts or nil
end

local function GetMapInfo(gs)
    local ok, mapName, mapId = pcall(function()
        local md = gs.CurrentMapData
        if not md or not md:IsValid() then return nil, nil end
        local okName, n = pcall(function() return md.Name:ToString() end)
        local okId,   i = pcall(function() return md:GetFName():ToString() end)
        local name = (okName and n and n ~= "" and n ~= "None") and n or nil
        local id   = (okId   and i and i ~= "" and i ~= "None") and i or nil
        return name, id
    end)
    if not ok then return nil, nil end
    return mapName, mapId
end

local function GetTerrainInfo(gs)
    local ok, terrainName, terrainId = pcall(function()
        local td = gs.CurrentTerrainData
        if not td or not td:IsValid() then return nil, nil end
        local okName, n = pcall(function() return td.Name:ToString() end)
        local okId,   i = pcall(function() return td:GetFName():ToString() end)
        local name = (okName and n and n ~= "" and n ~= "None") and n or nil
        local id   = (okId   and i and i ~= "" and i ~= "None") and i or nil
        return name, id
    end)
    if not ok then return nil, nil end
    return terrainName, terrainId
end

local function RegisterMatchmakingHook()
    local ok = pcall(function()
        RegisterHook(
            "/Script/Prometheus.PMMatchmakingUIData:HandleMatchmakingStatusChanged",
            function(self, MatchmakingStatus)
                pcall(function()
                    local s = MatchmakingStatus:get()
                    local state = s.State
                    if state == 1 then -- Idle
                        CapturedQueueId = nil
                    elseif state == 2 then -- Queued: only safe union member to read
                        local ok2, v = pcall(function() return s.Queued.Queue:ToString() end)
                        if ok2 and v and v ~= "" and v ~= "None" then
                            CapturedQueueId = v
                            print(string.format("[%s] Queue captured: %s", ModName, v))
                        end
                    end
                    -- 3 (FoundMatch), 4 (StartingGame), 5 (InGame): leave CapturedQueueId as-is
                end)
            end
        )
    end)
    if ok then
        print(string.format("[%s] Matchmaking hook registered", ModName))
    else
        print(string.format("[%s] Matchmaking hook unavailable (queue will be null)", ModName))
    end
end

local function WriteState(body)
    local f = io.open(STATE_FILE, "w")
    if not f then print("[" .. ModName .. "] Failed to write state file") return end
    f:write(body)
    f:close()
end

local function LogMatchState()
    local GameState = FindFirstOf("PMGameState")
    if GameState and GameState:IsValid() then
        local phase = GameState.CurrentMatchPhase
        local scoreInfo = GameState.MatchScoreInfo
        local t1 = scoreInfo.TeamOneInfo
        local t2 = scoreInfo.TeamTwoInfo
        local myTeam = GetLocalTeam()

        local mapName, mapId = GetMapInfo(GameState)
        local terrainName, terrainId = GetTerrainInfo(GameState)
        local matchStart = GetMatchStartTime(GameState)
        local queueId = CapturedQueueId

        local cur = {
            phase = phase,
            myTeam = myTeam,
            t1g = t1.NumGoalsThisSet, t1s = t1.NumSetsThisMatch,
            t2g = t2.NumGoalsThisSet, t2s = t2.NumSetsThisMatch,
            map = mapName, mapId = mapId,
            terrain = terrainName, terrainId = terrainId,
            matchStart = matchStart,
            queue = queueId,
        }

        local changed = false
        for k, v in pairs(cur) do
            if LastState[k] ~= v then changed = true break end
        end

        if changed then
            LastState = cur

            local phaseName = MatchPhaseNames[phase] or tostring(phase)

            print(string.format("\n========================================"))
            print(string.format("[%s] Phase: %s | Team: %s", ModName, phaseName, myTeam and ("Team "..myTeam) or "Unknown"))
            print(string.format("[%s] T1: %d goals, %d sets", ModName, t1.NumGoalsThisSet, t1.NumSetsThisMatch))
            print(string.format("[%s] T2: %d goals, %d sets", ModName, t2.NumGoalsThisSet, t2.NumSetsThisMatch))
            print(string.format("[%s] Map: %s (%s) | Terrain: %s (%s) | Queue: %s | MatchStart: %s",
                ModName, mapName or "null", mapId or "null", terrainName or "null", terrainId or "null",
                queueId or "null", matchStart and tostring(matchStart) or "null"))
            print(string.format("========================================\n"))

            local resolvedMap   = (mapId == "GMD_RGM") and terrainName or mapName
            local resolvedMapId = (mapId == "GMD_RGM") and terrainId   or mapId
            local mapStr        = resolvedMap   and ('"' .. resolvedMap   .. '"') or "null"
            local mapIdStr      = resolvedMapId and ('"' .. resolvedMapId .. '"') or "null"
            local terrainStr    = terrainName   and ('"' .. terrainName   .. '"') or "null"
            local terrainIdStr  = terrainId     and ('"' .. terrainId     .. '"') or "null"
            local queueStr      = queueId       and ('"' .. queueId       .. '"') or "null"
            local matchStartStr = matchStart    and tostring(matchStart)          or "null"
            WriteState(string.format(
                '{"phase":"%s","my_team":%s,"t1_goals":%d,"t1_sets":%d,"t2_goals":%d,"t2_sets":%d,"map":%s,"map_id":%s,"terrain":%s,"terrain_id":%s,"queue":%s,"match_start":%s,"timestamp":%d}',
                phaseName,
                myTeam and tostring(myTeam) or "null",
                t1.NumGoalsThisSet, t1.NumSetsThisMatch,
                t2.NumGoalsThisSet, t2.NumSetsThisMatch,
                mapStr, mapIdStr, terrainStr, terrainIdStr, queueStr, matchStartStr,
                os.time()
            ))
        end
    end

    ExecuteWithDelay(3000, LogMatchState)
end

RegisterMatchmakingHook()
ExecuteWithDelay(3000, LogMatchState)