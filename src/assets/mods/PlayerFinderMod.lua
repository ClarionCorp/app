local ModName = "PlayerFinderMod"
local ModVersion = "1.0.0"

print(string.format("\n=== %s v%s Loaded ===\n", ModName, ModVersion))

local PLAYERS_FILE = os.getenv("TEMP") .. "\\ue4ss_players.json"
print(string.format("[%s] Writing players to: %s", ModName, PLAYERS_FILE))

local LastSnapshot = ""

local function GetCharacter(ps)
    local cd = ps.ChosenCharacterData
    if not cd or not cd:IsValid() then return nil, nil end
    local ok1, id   = pcall(function() return cd:GetFName():ToString() end)
    local ok2, name = pcall(function() return cd.InGameName:ToString() end)
    return ok1 and id or nil, ok2 and name or nil
end

local function PollPlayers()
    local states = FindAllOf("PMPlayerState")
    if not states then
        ExecuteWithDelay(3000, PollPlayers)
        return
    end

    local players = {}
    for _, ps in ipairs(states) do
        if ps and ps:IsValid() then
            local ok, entry = pcall(function()
                local name = ps.PMDisplayName:ToString()
                local team = ps.AssignedTeam
                local charId, charName = GetCharacter(ps)
                local ok, isGoalie = pcall(function() return ps:IsGoalie() end)
                local role = (ok and isGoalie) and "Goalie" or "Forward"
                local level = ps.Level
                if name == "" or name == "nil" then return nil end
                return { name = name, team = team, charId = charId, charName = charName, role = role, level = level }
            end)
            if ok and entry then
                table.insert(players, entry)
            end
        end
    end

    -- Build JSON and snapshot string for change detection
    local parts = {}
    local snapshot = ""
    for _, p in ipairs(players) do
        local charIdStr   = p.charId   and ('"' .. p.charId   .. '"') or "null"
        local charNameStr = p.charName and ('"' .. p.charName .. '"') or "null"
        table.insert(parts, string.format(
            '{"name":"%s","team":%s,"role":"%s","character_id":%s,"character_name":%s,"level":%s}',
            p.name, tostring(p.team), p.role, charIdStr, charNameStr, tostring(p.level)
        ))
        snapshot = snapshot .. p.name .. "|" .. tostring(p.team) .. "|" .. p.role .. "|" .. tostring(p.charId) .. "|" .. tostring(p.level) .. ";"
    end

    if snapshot ~= LastSnapshot then
        LastSnapshot = snapshot

        print(string.format("\n[%s] Players (%d):", ModName, #players))
        for _, p in ipairs(players) do
            print(string.format("  Team %s | %-8s | Lv%-3s | %s | %s (%s)", tostring(p.team), p.role, tostring(p.level), p.name, p.charName or "null", p.charId or "null"))
        end

        local json = string.format('{"timestamp":%d,"players":[%s]}', os.time(), table.concat(parts, ","))
        local f = io.open(PLAYERS_FILE, "w")
        if f then f:write(json) f:close() end
    end

    ExecuteWithDelay(3000, PollPlayers)
end

RegisterKeyBind(Key.F5, function()
    LastSnapshot = ""
    print(string.format("[%s] Force refresh triggered", ModName))
end)

ExecuteWithDelay(3000, PollPlayers)