local Module = {}

-- Edits postgame.json in place

local GameResolutionNames = { [0] = "Normal", [1] = "Surrender", [2] = "AutoCancel" }

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

local function buildPlayerMap()
    local map = {}
    local states = FindAllOf("PMPlayerState")
    if not states then return map end
    for _, ps in ipairs(states) do
        if ps and ps:IsValid() then
            pcall(function()
                local id = fname(ps.PMPlayerId)
                if id == "" then return end
                local name = ""
                pcall(function() name = ps.PMDisplayName:ToString() end)
                if name == "" then
                    pcall(function() name = ps.PlayerName:ToString() end)
                end
                map[id] = { name = name, team = ps.AssignedTeam }
            end)
        end
    end
    return map
end

local function collectStats(log)
    local stats = {}

    local function get(id)
        if id == "" then return nil end
        if not stats[id] then
            stats[id] = { goals = 0, assists = 0, saves = 0, kos = 0, redirects = 0, damage = 0, shots = 0, orbs = 0 }
        end
        return stats[id]
    end

    pcall(function()
        for i = 1, #log.GoalsScored do
            local ev = log.GoalsScored[i]
            local scorerId = (ev.bHasCreditedPlayer and fname(ev.CreditedPlayerId) ~= "") and fname(ev.CreditedPlayerId) or fname(ev.InstigatingPlayerId)
            local s = get(scorerId)
            if s then s.goals = s.goals + 1 end
            pcall(function()
                for j = 1, #ev.AssistingPlayerIds do
                    local a = get(fname(ev.AssistingPlayerIds[j]))
                    if a then a.assists = a.assists + 1 end
                end
            end)
        end
    end)

    pcall(function()
        for i = 1, #log.GoalsSaved do
            local s = get(fname(log.GoalsSaved[i].DefendingPlayerId))
            if s then s.saves = s.saves + 1 end
        end
    end)

    pcall(function()
        for i = 1, #log.CharactersKnockedOut do
            local s = get(fname(log.CharactersKnockedOut[i].InstigatingPlayerId))
            if s then s.kos = s.kos + 1 end
        end
    end)

    pcall(function()
        for i = 1, #log.PlayerMatchEvents do
            local perMatch = log.PlayerMatchEvents[i]
            local s = get(fname(perMatch.PlayerId))
            if s then
                pcall(function()
                    local ev = perMatch.PlayerMatchEvents
                    s.redirects = ev.RedirectRock
                    s.damage = ev.DamageDoneToPlayers
                    s.shots = ev.HitRockIntoGoalArea
                    s.orbs = ev.PowerUpsPickedUpCount
                end)
            end
        end
    end)

    return stats
end

local function WriteMatchCompleted(ModName, POSTGAME_FILE, log)
    local playerMap = buildPlayerMap()
    local stats = collectStats(log)

    local okMvp, mvpId = pcall(function() return fname(log.FinalScore.MatchMVP) end)
    mvpId = (okMvp and mvpId ~= "") and mvpId or nil

    local okWin, winningTeam = pcall(function() return log.WinningTeam end)
    local okRes, resolution = pcall(function() return log.GameResolution end)
    local resolutionName = (okRes and GameResolutionNames[resolution]) or "?"

    local playerParts = {}
    for id, s in pairs(stats) do
        local info = playerMap[id] or {}
        table.insert(playerParts, string.format(
            '{"player_id":"%s","name":"%s","team":%s,"goals":%d,"assists":%d,"saves":%d,' ..
            '"knockouts":%d,"redirects":%d,"damage":%d,"shots":%d,"orbs":%d,"mvp":%s}',
            id, (info.name or id):gsub('"', '\\"'), numOrNull(info.team),
            s.goals, s.assists, s.saves, s.kos, s.redirects, s.damage, s.shots, s.orbs,
            tostring(mvpId ~= nil and id == mvpId)
        ))
    end
    local playersJson = (#playerParts > 0) and ("[" .. table.concat(playerParts, ",") .. "]") or "[]"

    local mvpInfo = playerMap[mvpId]
    local mvpJson = "null"
    if mvpId and mvpInfo then
        mvpJson = string.format('{"player_id":"%s","name":"%s","team":%s}',
            mvpId, mvpInfo.name:gsub('"', '\\"'), numOrNull(mvpInfo.team))
    end

    print(string.format("[%s] Match completed: %d players, MVP=%s\n", ModName, #playerParts, (mvpInfo and mvpInfo.name) or "?"))

    local body = string.format(
        '{\n  "winning_team": %s,\n  "resolution": "%s",\n  "mvp": %s,\n  "players": %s,\n  "timestamp": %d\n}\n',
        okWin and tostring(winningTeam) or "null", resolutionName, mvpJson, playersJson, os.time()
    )

    local f = io.open(POSTGAME_FILE, "w")
    if not f then print(string.format("[%s] Failed to write postgame file\n", ModName)) return end
    f:write(body)
    f:close()
end

function Module.Init(ModName, OUT_DIR)
    local POSTGAME_FILE = OUT_DIR .. "\\postgame.json"
    print(string.format("[%s] Writing post-game stats to: %s\n", ModName, POSTGAME_FILE))

    local hookRegistered = false
    local lastWriteTime = 0

    local function tryRegisterHook()
        if hookRegistered then return true end

        local ok = pcall(function()
            RegisterHook(
                "/Script/Prometheus.PMGameStateBase:MatchCompleted_Multicast",
                function(self, MatchEventLogParam)
                    local now = os.time()
                    if now - lastWriteTime < 5 then
                        print(string.format("[%s] MatchCompleted duplicate fire ignored (within 5s cooldown)\n", ModName))
                        return
                    end
                    lastWriteTime = now

                    local ok2, log = pcall(function() return MatchEventLogParam:get() end)
                    if not ok2 or not log then
                        print(string.format("[%s] MatchCompleted: could not unwrap MatchEventLog param\n", ModName))
                        return
                    end

                    local ok3, err = pcall(function() WriteMatchCompleted(ModName, POSTGAME_FILE, log) end)
                    if not ok3 then print(string.format("[%s] MatchCompleted ERROR: %s\n", ModName, tostring(err))) end
                end
            )
        end)

        if ok then
            hookRegistered = true
            print(string.format("[%s] PMGameStateBase:MatchCompleted_Multicast hook registered\n", ModName))
            return true
        end
        return false
    end

    local function retry()
        local ok, registered = pcall(tryRegisterHook)
        if not ok then
            print(string.format("[%s] MatchCompleted retry error: %s\n", ModName, tostring(registered)))
        end
        if not ok or not registered then
            ExecuteWithDelay(30000, retry)
        end
    end

    local ok, registered = pcall(tryRegisterHook)
    if not ok then
        print(string.format("[%s] MatchCompleted initial hook registration error: %s\n", ModName, tostring(registered)))
    end
    if not ok or not registered then
        print(string.format("[%s] MatchCompleted hook not available yet, retrying every 30s...\n", ModName))
        ExecuteWithDelay(30000, retry)
    end
end

return Module