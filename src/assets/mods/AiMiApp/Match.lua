local Module = {}

-- Edits meta.json in place (evolving state, not a discrete event)
local StartTime = nil
local LastSnapshot = ""
local LastTrainings = {}

local function GetMapInfo(gs)
    local ok, mapName, mapId = pcall(function()
        local md = gs.CurrentMapData
        if not md or not md:IsValid() then return nil, nil end
        local okName, n = pcall(function() return md.Name:ToString() end)
        local okId, i = pcall(function() return md:GetFName():ToString() end)
        local name = (okName and n and n ~= "" and n ~= "None") and n or nil
        local id = (okId and i and i ~= "" and i ~= "None") and i or nil
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
        local okId, i = pcall(function() return td:GetFName():ToString() end)
        local name = (okName and n and n ~= "" and n ~= "None") and n or nil
        local id = (okId and i and i ~= "" and i ~= "None") and i or nil
        return name, id
    end)
    if not ok then return nil, nil end
    return terrainName, terrainId
end

local function GetBannedCharacters(gs)
    local ids = {}
    pcall(function()
        local data = gs.BannedCharactersData
        local function tryAdd(cd)
            if cd and cd:IsValid() then
                local ok, id = pcall(function() return cd:GetFName():ToString() end)
                if ok and id and id ~= "" and id ~= "None" then
                    table.insert(ids, id)
                end
            end
        end
        tryAdd(data.TeamOneBannedCharacter)
        tryAdd(data.TeamTwoBannedCharacter)
    end)
    return ids
end

local function GetTrainings(gs)
    local ids = {}
    pcall(function()
        local trainings = gs.CommonTrainings
        for i = 1, #trainings do
            pcall(function()
                local td = trainings[i].TrainingData
                if td and td:IsValid() then
                    local ok, id = pcall(function() return td:GetFName():ToString() end)
                    if ok and id and id ~= "" and id ~= "None" then
                        table.insert(ids, id)
                    end
                end
            end)
        end
    end)
    table.sort(ids)
    return ids
end

local function WriteMatchState(ModName, MATCH_FILE)
    local GameState = FindFirstOf("PMGameState")
    if not (GameState and GameState:IsValid()) then return end

    local scoreInfo = GameState.MatchScoreInfo
    local t1 = scoreInfo.TeamOneInfo
    local t2 = scoreInfo.TeamTwoInfo
    local mapName, mapId = GetMapInfo(GameState)
    local terrainName, terrainId = GetTerrainInfo(GameState)
    local bannedIds = GetBannedCharacters(GameState)
    local bannedKey = table.concat(bannedIds, ",")
    local trainingsKey = table.concat(LastTrainings, ",")

    -- Random-map mode (GMD_RGM) reports the terrain as the real map.
    local resolvedMap = (mapId == "GMD_RGM") and terrainName or mapName
    local resolvedMapId = (mapId == "GMD_RGM") and terrainId or mapId

    local snapshot = table.concat({
        tostring(StartTime), t1.NumGoalsThisSet, t1.NumSetsThisMatch,
        t2.NumGoalsThisSet, t2.NumSetsThisMatch, tostring(resolvedMap), tostring(resolvedMapId),
        bannedKey, trainingsKey,
    }, "|")

    if snapshot == LastSnapshot then return end
    LastSnapshot = snapshot

    local mapStr = resolvedMap and ('"' .. resolvedMap .. '"') or "null"
    local mapIdStr = resolvedMapId and ('"' .. resolvedMapId .. '"') or "null"

    local bannedParts = {}
    for _, id in ipairs(bannedIds) do
        table.insert(bannedParts, '"' .. id .. '"')
    end
    local bannedJson = "[" .. table.concat(bannedParts, ",") .. "]"

    local trainingsParts = {}
    for _, id in ipairs(LastTrainings) do
        table.insert(trainingsParts, '"' .. id .. '"')
    end
    local trainingsJson = "[" .. table.concat(trainingsParts, ",") .. "]"

    local body = string.format(
        '{\n  "start_time": %s,\n  "team1": {"goals": %d, "sets": %d},\n  "team2": {"goals": %d, "sets": %d},\n  "map": {"name": %s, "id": %s},\n  "banned_characters": %s,\n  "trainings": %s,\n  "timestamp": %d\n}\n',
        StartTime and tostring(StartTime) or "null",
        t1.NumGoalsThisSet, t1.NumSetsThisMatch,
        t2.NumGoalsThisSet, t2.NumSetsThisMatch,
        mapStr, mapIdStr,
        bannedJson,
        trainingsJson,
        os.time()
    )

    local f = io.open(MATCH_FILE, "w")
    if not f then print(string.format("[%s] Failed to write match file", ModName)) return end
    f:write(body)
    f:close()
    print(string.format("[%s] Match: Updated score", ModName))
end

function Module.Init(ModName, OUT_DIR)
    local MATCH_FILE = OUT_DIR .. "\\match.json"
    print(string.format("[%s] Writing match state to: %s", ModName, MATCH_FILE))

    pcall(function()
        RegisterHook("/Script/Prometheus.PMPlayerControllerGame:MatchPhaseChanged",
            function(self, OldPhase, NewPhase)
                pcall(function()
                    if NewPhase:get() == 1 then -- PreGame = new match starting
                        StartTime = os.time()
                        LastTrainings = {}
                        print(string.format("[%s] New match starting, start_time=%d", ModName, StartTime))
                    end
                    WriteMatchState(ModName, MATCH_FILE)
                end)
            end
        )
        print(string.format("[%s] MatchPhaseChanged hook registered (match state)", ModName))
    end)

    -- Fires exactly when CommonTrainings actually replicates, instead of guessing at a phase when it's likely populated.
    pcall(function()
        RegisterHook("/Script/Prometheus.PMGameState:OnRep_CommonTrainings",
            function(self)
                pcall(function()
                    local gs = self:get()
                    if not gs or not gs:IsValid() then return end
                    local trainings = GetTrainings(gs)
                    if #trainings == 0 then return end -- The game replicates CommonTrainings back to empty once intermission ends
                    LastTrainings = trainings
                    print(string.format("[%s] Trainings updated (%d): %s", ModName, #LastTrainings, table.concat(LastTrainings, ",")))
                    WriteMatchState(ModName, MATCH_FILE)
                end)
            end
        )
        print(string.format("[%s] OnRep_CommonTrainings hook registered", ModName))
    end)

    -- Capture state on mod load too (hook won't fire for the current phase).
    ExecuteWithDelay(3000, function() pcall(function() WriteMatchState(ModName, MATCH_FILE) end) end)
end

return Module
