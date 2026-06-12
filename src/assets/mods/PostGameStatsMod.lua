
local ModName = "PostGameStatsMod"
local ModVersion = "3.1.1"

print(string.format("\n=== %s v%s Loaded ===", ModName, ModVersion))
print("[PGSM] Output -> " .. os.getenv("TEMP") .. "\\PostGameStats.json")

local hookRegistered = false
local lastWriteTime = 0

local function fname(v)
    if not v then return "" end
    local ok, s = pcall(function() return v:ToString() end)
    return ok and s or ""
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
                map[id] = { name = name, team = tostring(ps.AssignedTeam) }
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
            stats[id] = { goals=0, assists=0, saves=0, kos=0, redirects=0, damage=0, shots=0, orbs=0 }
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

local function writeStats(players)
    local rows = {}
    for _, p in ipairs(players) do
        table.insert(rows, string.format(
            '  {\n' ..
            '    "id": "%s",\n' ..
            '    "name": "%s",\n' ..
            '    "team": "%s",\n' ..
            '    "goals": %d,\n' ..
            '    "assists": %d,\n' ..
            '    "saves": %d,\n' ..
            '    "kos": %d,\n' ..
            '    "redirects": %d,\n' ..
            '    "damage": %d,\n' ..
            '    "shots": %d,\n' ..
            '    "orbs": %d\n' ..
            '  }',
            p.id, p.name:gsub('"', '\\"'), p.team,
            p.goals, p.assists, p.saves, p.kos, p.redirects, p.damage, p.shots, p.orbs
        ))
    end

    local path = os.getenv("TEMP") .. "\\PostGameStats.json"
    local f = io.open(path, "w")
    if f then
        f:write("[\n" .. table.concat(rows, ",\n") .. "\n]\n")
        f:close()
        print("[PGSM] Wrote stats for " .. #players .. " players → " .. path)
    else
        print("[PGSM] ERROR: Could not open " .. path)
    end
end

local function tryRegisterHook()
    if hookRegistered then return true end

    local ok = pcall(function()
        RegisterHook(
            "/Script/Prometheus.PMGameStateBase:MatchCompleted_Multicast",
            function(self, MatchEventLogParam)
                local now = os.time()
                if now - lastWriteTime < 5 then
                    print("[PGSM] Duplicate fire ignored (within 5s cooldown)")
                    return
                end
                lastWriteTime = now

                print("\n[PGSM] MatchCompleted fired! Collecting from event log...")

                local ok, log = pcall(function() return MatchEventLogParam:get() end)
                if not ok or not log then
                    print("[PGSM] ERROR: Could not unwrap MatchEventLog param")
                    return
                end

                local playerMap = buildPlayerMap()
                local stats = collectStats(log)

                local players = {}
                for id, s in pairs(stats) do
                    local info = playerMap[id] or {}
                    table.insert(players, {
                        id = id,
                        name  = info.name or id,
                        team = info.team or "0",
                        goals = s.goals,
                        assists = s.assists,
                        saves = s.saves,
                        kos = s.kos,
                        redirects = s.redirects,
                        damage = s.damage,
                        shots = s.shots,
                        orbs = s.orbs,
                    })
                end

                print(string.format("[PGSM] Collected %d players", #players))
                writeStats(players)
            end
        )
    end)

    if ok then
        hookRegistered = true
        print("[PGSM] Hook registered")
        return true
    end
    return false
end

if not tryRegisterHook() then
    print("[PGSM] Hook not available yet, retrying every 30s...")
    local attempts = 0
    local function retry()
        attempts = attempts + 1
        print(string.format("[PGSM] Registration attempt #%d", attempts))
        if not tryRegisterHook() then
            ExecuteWithDelay(30000, retry)
        end
    end
    ExecuteWithDelay(30000, retry)
end