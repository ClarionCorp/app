local ModName = "PlayerFinderMod"
local ModVersion = "1.3.1"

print(string.format("\n=== %s v%s Loaded ===\n", ModName, ModVersion))

local PLAYERS_FILE = os.getenv("TEMP") .. "\\ue4ss_players.json"
print(string.format("[%s] Writing players to: %s", ModName, PLAYERS_FILE))

local LastSnapshot = ""
local LastPings = {}
local TrackedStates = {}

local function GetCharacter(ps)
    local cd = ps.ChosenCharacterData
    if not cd or not cd:IsValid() then return nil, nil end
    local ok1, id   = pcall(function() return cd:GetFName():ToString() end)
    local ok2, name = pcall(function() return cd.InGameName:ToString() end)
    return ok1 and id or nil, ok2 and name or nil
end

local function GetTrainings(ps)
    local ids = {}
    pcall(function()
        local trainings = ps.EquippedTrainings
        for i = 1, #trainings do
            local t = trainings[i]
            if t and t:IsValid() then
                local ok, id = pcall(function() return t:GetFName():ToString() end)
                if ok and id ~= "" then
                    table.insert(ids, id)
                end
            end
        end
    end)
    return ids
end

local function PollPlayers()
    -- Prune stale references (disconnected players)
    local valid = {}
    for _, ps in ipairs(TrackedStates) do
        if ps and ps:IsValid() then
            table.insert(valid, ps)
        end
    end
    TrackedStates = valid

    local players = {}
    for _, ps in ipairs(TrackedStates) do
        if ps and ps:IsValid() then
            local ok, entry = pcall(function()
                local name = ps.PMDisplayName:ToString()
                local team = ps.AssignedTeam
                local charId, charName = GetCharacter(ps)
                local ok, isGoalie = pcall(function() return ps:IsGoalie() end)
                local role = (ok and isGoalie) and "Goalie" or "Forward"
                local level = ps.Level
                local trainings = GetTrainings(ps)
                local okPing, ping = pcall(function() return ps:GetPingInMilliseconds() end)
                local pingMs = (okPing and ping) and math.floor(ping) or nil
                if name == "" or name == "nil" then return nil end
                return { name = name, team = team, charId = charId, charName = charName, role = role, level = level, trainings = trainings, ping = pingMs }
            end)
            if ok and entry then
                table.insert(players, entry)
            end
        end
    end

    -- Build snapshot string for change detection
    local snapshot = ""
    for _, p in ipairs(players) do
        snapshot = snapshot .. p.name .. "|" .. tostring(p.team) .. "|" .. p.role .. "|" .. tostring(p.charId) .. "|" .. tostring(p.level) .. ";"
    end

    local pingChanged = false
    for _, p in ipairs(players) do
        if p.ping ~= nil then
            local last = LastPings[p.name]
            if last ~= nil and math.abs(p.ping - last) >= 20 then
                pingChanged = true
                break
            end
        end
    end

    if snapshot ~= LastSnapshot or pingChanged then
        LastSnapshot = snapshot
        LastPings = {}
        for _, p in ipairs(players) do
            if p.ping ~= nil then LastPings[p.name] = p.ping end
        end

        print(string.format("\n[%s] Players (%d):", ModName, #players))
        for _, p in ipairs(players) do
            print(string.format("  Team %s | %-8s | Lv%-3s |%3sms | %s | %s (%s)", tostring(p.team), p.role, tostring(p.level), tostring(p.ping or "?"), p.name, p.charName or "null", p.charId or "null"))
        end

        local playerParts = {}
        for _, p in ipairs(players) do
            local charIdStr   = p.charId   and ('"' .. p.charId .. '"') or "null"
            local charNameStr = p.charName and ('"' .. p.charName .. '"') or "null"
            local trainingStrs = {}
            for _, tid in ipairs(p.trainings) do
                table.insert(trainingStrs, '        "' .. tid .. '"')
            end
            local trainingsJson = "[\n" .. table.concat(trainingStrs, ",\n") .. "\n      ]"
            if #p.trainings == 0 then trainingsJson = "[]" end
            local pingStr = p.ping and tostring(p.ping) or "null"
            table.insert(playerParts, string.format(
                '    {\n' ..
                '      "name": "%s",\n' ..
                '      "team": %s,\n' ..
                '      "role": "%s",\n' ..
                '      "character_id": %s,\n' ..
                '      "character_name": %s,\n' ..
                '      "level": %s,\n' ..
                '      "ping_ms": %s,\n' ..
                '      "trainings": %s\n' ..
                '    }',
                p.name, tostring(p.team), p.role, charIdStr, charNameStr, tostring(p.level), pingStr, trainingsJson
            ))
        end

        local json = string.format(
            '{\n  "timestamp": %d,\n  "players": [\n%s\n  ]\n}\n',
            os.time(), table.concat(playerParts, ",\n")
        )
        local f = io.open(PLAYERS_FILE, "w")
        if f then f:write(json) f:close() end
    end

    ExecuteWithDelay(3000, PollPlayers)
end

RegisterKeyBind(Key.F5, function()
    LastSnapshot = ""
    print(string.format("[%s] Force refresh triggered", ModName))
end)

-- Cache PlayerState refs as they're created so PollPlayers never needs FindAllOf
NotifyOnNewObject("/Script/Prometheus.PMPlayerState", function(ps)
    if ps and ps:IsValid() then
        table.insert(TrackedStates, ps)
        print(string.format("[%s] New PMPlayerState detected (total tracked: %d)", ModName, #TrackedStates))
    end
end)

-- Seed cache with any states that already exist (mod loaded mid-game), then start loop
ExecuteWithDelay(1000, function()
    local existing = FindAllOf("PMPlayerState")
    if existing then
        for _, ps in ipairs(existing) do
            if ps and ps:IsValid() then
                table.insert(TrackedStates, ps)
            end
        end
    end
    PollPlayers()
end)