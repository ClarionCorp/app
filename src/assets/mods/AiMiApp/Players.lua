local Module = {}

-- Edits players.json in place (evolving state, not a discrete event)
local TrackedStates = {}
local LastSnapshot = ""
local LastPings = {}
local IdentityCache = {}

-- Per-match knockout counts, keyed by PMPlayerId string; reset on PreGame.
local KoCounts = {}

local function fname(v)
    if not v then return "" end
    local ok, s = pcall(function() return v:ToString() end)
    return ok and s or ""
end

-- Lua nil has no JSON representation, convert to null instead.
local function numOrNull(v)
    if v == nil then return "null" end
    return tostring(v)
end

local function GetCharacter(ps)
    local cd = ps.ChosenCharacterData
    if not cd or not cd:IsValid() then return nil, nil end
    local ok1, id = pcall(function() return cd:GetFName():ToString() end)
    local ok2, name = pcall(function() return cd.InGameName:ToString() end)
    return ok1 and id or nil, ok2 and name or nil
end

-- A player's current trainings for this match.
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

-- Resolves once and caches: display name, playerId, team, character, and role
local function GetIdentity(ps)
    local cached = IdentityCache[ps]
    if cached then return cached end

    local ok, identity = pcall(function()
        local name = ps.PMDisplayName:ToString()
        if name == "" or name == "nil" then return nil end
        local playerId = fname(ps.PMPlayerId)
        local team = ps.AssignedTeam
        local charId, charName = GetCharacter(ps)
        
        -- Don't cache a guessed role off a failed call (bail and retry next poll instead)
        local okGoalie, isGoalie = pcall(function() return ps:IsGoalie() end)
        if not okGoalie then return nil end
        local role = isGoalie and "Goalie" or "Forward"
        return { name = name, playerId = playerId, team = team, charId = charId, charName = charName, role = role }
    end)
    if ok and identity and identity.charId then
        IdentityCache[ps] = identity
    end
    return ok and identity or nil
end

local function BuildRoster()
    local valid = {}
    for _, ps in ipairs(TrackedStates) do
        if ps and ps:IsValid() then table.insert(valid, ps) end
    end
    TrackedStates = valid

    local roster = {}
    for _, ps in ipairs(TrackedStates) do
        local identity = GetIdentity(ps)
        if identity then
            local ok, entry = pcall(function()
                local trainings = GetTrainings(ps)
                local level = ps.Level
                local okPing, ping = pcall(function() return ps:GetPingInMilliseconds() end)
                local pingMs = (okPing and ping) and math.floor(ping) or nil
                local okLvls, lvlsGained = pcall(function() return ps:GetCharacterLevelsGainedSinceIntermission() end)
                local levelsGained = okLvls and lvlsGained or nil
                local kos = identity.playerId ~= "" and (KoCounts[identity.playerId] or 0) or 0
                return {
                    name = identity.name, team = identity.team, playerId = identity.playerId, role = identity.role,
                    charId = identity.charId, charName = identity.charName, trainings = trainings,
                    level = level, ping = pingMs, levelsGained = levelsGained, kos = kos,
                }
            end)
            if ok and entry then table.insert(roster, entry) end
        end
    end
    return roster
end

local function TrainingsJson(trainings)
    local parts = {}
    for _, id in ipairs(trainings) do table.insert(parts, '"' .. id .. '"') end
    return table.concat(parts, ",")
end

local function WriteRoster(ModName, PLAYERS_FILE)
    local roster = BuildRoster()

    local snapshot = ""
    local pingChanged = false
    for _, p in ipairs(roster) do
        snapshot = snapshot .. p.name .. "|" .. tostring(p.team) .. "|" .. p.role .. "|" .. tostring(p.charId)
            .. "|" .. tostring(p.level) .. "|" .. tostring(p.levelsGained) .. "|" .. tostring(p.kos)
            .. "|" .. table.concat(p.trainings, ",") .. ";"
        if p.ping ~= nil then
            local last = LastPings[p.name]
            if last ~= nil and math.abs(p.ping - last) >= 20 then
                pingChanged = true
            end
        end
    end
    local snapshotChanged = (snapshot ~= LastSnapshot)
    if not snapshotChanged and not pingChanged then return end
    local writeReason = snapshotChanged and "content" or "ping"
    LastSnapshot = snapshot

    LastPings = {}
    for _, p in ipairs(roster) do
        if p.ping ~= nil then LastPings[p.name] = p.ping end
    end

    local rosterParts = {}
    for _, p in ipairs(roster) do
        table.insert(rosterParts, string.format(
            '    {"name":"%s","player_id":"%s","team":%s,"role":"%s","character_id":%s,"character_name":%s,' ..
            '"xp":%s,"intermission_xp":%s,"ping_ms":%s,"knockouts":%d,"trainings":[%s]}',
            p.name, p.playerId, numOrNull(p.team), p.role,
            p.charId and ('"' .. p.charId .. '"') or "null",
            p.charName and ('"' .. p.charName .. '"') or "null",
            numOrNull(p.level), numOrNull(p.levelsGained), numOrNull(p.ping), p.kos,
            TrainingsJson(p.trainings)
        ))
    end
    local rosterJson = (#roster > 0) and ("[\n" .. table.concat(rosterParts, ",\n") .. "\n  ]") or "[]"

    local body = string.format(
        '{\n  "players": %s,\n  "timestamp": %d\n}\n',
        rosterJson, os.time()
    )

    -- os.clock() is wall time on Windows (unlike POSIX, where it's CPU time), so this
    -- includes any time blocked on the syscall -- e.g. AV/cloud-sync scanning the write.
    local writeStart = os.clock()
    local f = io.open(PLAYERS_FILE, "w")
    if not f then print(string.format("[%s] Failed to write players file\n", ModName)) return end
    f:write(body)
    f:close()
    local writeMs = (os.clock() - writeStart) * 1000
    print(string.format("[%s] Roster: Updated %d players (reason=%s, write=%.1fms)\n", ModName, #roster, writeReason, writeMs))
end

function Module.Init(ModName, OUT_DIR)
    local PLAYERS_FILE = OUT_DIR .. "\\players.json"
    print(string.format("[%s] Writing roster to: %s\n", ModName, PLAYERS_FILE))

    -- Cache PlayerState refs as they're created, same as PlayerFinderMod. (optimization)
    NotifyOnNewObject("/Script/Prometheus.PMPlayerState", function(ps)
        if ps and ps:IsValid() then
            table.insert(TrackedStates, ps)
        end
    end)

    local function PollRoster()
        pcall(function() WriteRoster(ModName, PLAYERS_FILE) end)
        ExecuteWithDelay(3000, PollRoster)
    end

    pcall(function()
        RegisterHook("/Script/Prometheus.PMGameState:ShowKnockoutInfo_Multicast",
            function(self, InstigatingPlayer, KnockedOutPlayer, UtcTimestamp)
                pcall(function()
                    local ins = InstigatingPlayer:get()
                    if not ins or not ins:IsValid() then return end
                    local pid = fname(ins.PMPlayerId)
                    if pid == "" then return end
                    KoCounts[pid] = (KoCounts[pid] or 0) + 1
                    print(string.format("[%s] KO! %s -> %d total\n", ModName, fname(ins.PMDisplayName), KoCounts[pid]))
                    WriteRoster(ModName, PLAYERS_FILE)
                end)
            end
        )
        print(string.format("[%s] KO hook registered\n", ModName))
    end)

    pcall(function()
        RegisterHook("/Script/Prometheus.PMPlayerControllerGame:MatchPhaseChanged",
            function(self, OldPhase, NewPhase)
                local calcStart = os.clock() -- performance.now() ahh
                if NewPhase:get() == 1 then -- PreGame = new match starting
                    KoCounts = {}
                    LastSnapshot = ""

                    -- Hard reset instead of relying solely on :IsValid() pruning next poll,
                    -- so stale-but-still-valid PlayerStates from past matches can't linger all session.
                    TrackedStates = {}
                    IdentityCache = {}
                    local existing = FindAllOf("PMPlayerState")
                    if existing then
                        for _, ps in ipairs(existing) do
                            if ps and ps:IsValid() then table.insert(TrackedStates, ps) end
                        end
                    end

                    print(string.format("[%s] PreGame -- KO counts reset, tracked states reseeded (%d)\n", ModName, #TrackedStates))
                end
                local calcMs = (os.clock() - calcStart) * 1000
                print(string.format("[%s] [PLAYERS] MatchPhaseChanged calc took %.2fms\n", ModName, calcMs))
            end
        )
        print(string.format("[%s] MatchPhaseChanged hook registered (roster)\n", ModName))
    end)

    RegisterKeyBind(Key.F5, function()
        LastSnapshot = ""
        print(string.format("[%s] Force refresh triggered\n", ModName))
    end)

    -- Seed cache with any states that already exist (mod loaded mid-game), then start polling.
    ExecuteWithDelay(1000, function()
        local existing = FindAllOf("PMPlayerState")
        if existing then
            for _, ps in ipairs(existing) do
                if ps and ps:IsValid() then table.insert(TrackedStates, ps) end
            end
        end
        PollRoster()
    end)
end

return Module