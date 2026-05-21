
local ModName = "PostGameStatsMod"
local ModVersion = "2.0.0"

print(string.format("\n=== %s v%s Loaded ===\n", ModName, ModVersion))
print("Outputting to: " .. os.getenv("TEMP") .. "\\PostGameStats.json")

local statsCollected = false
local hookRegistered = false

local function writeStats(players)
    local json = "[\n"
    for i, p in ipairs(players) do
        json = json .. "  {\n"
        local entries = {}
        for k, v in pairs(p) do
            table.insert(entries, string.format('    "%s": "%s"', k, tostring(v)))
        end
        json = json .. table.concat(entries, ",\n") .. "\n  }"
        if i < #players then json = json .. "," end
        json = json .. "\n"
    end
    json = json .. "]\n"

    local filePath = os.getenv("TEMP") .. "\\PostGameStats.json"
    local file = io.open(filePath, "w")
    if file then
        file:write(json)
        file:close()
        print("[PGSM] Wrote stats to " .. filePath)
    else
        print("[PGSM] Failed to write stats file")
    end
end

local function collectStats()
    print(string.format("\n[PGSM] Attempting to collect stats..."))
    
    local rows = FindAllOf("WBP_EndOfGame_PlayerStatRow_C")
    
    if not rows or #rows == 0 then
        print("[PGSM] No rows found")
        return false
    end
    
    print(string.format("[PGSM] Found %d stat rows", #rows))
    
    local players = {}
    for _, row in ipairs(rows) do
        local ok, player = pcall(function()
            if not row.Redirects or not row.Redirects:IsValid() then return nil end
            
            local name = row.PlayerName:GetText():ToString()
            if name == "PlayerName" then return nil end
            name = name:gsub("<[^>]+>", "")
            
            local goals, assists = row.GoalsPlusAssists:GetText():ToString():match("(%d+)%+(%d+)")
            
            return {
                name = name,
                goals = goals or "0",
                assists = assists or "0",
                saves = row.Saves:GetText():ToString(),
                kos = row.KOs:GetText():ToString(),
                redirects = row.Redirects:GetText():ToString(),
                shots = row.Shots:GetText():ToString(),
                damage = row.Damage:GetText():ToString():gsub(",", ""),
                orbs = row.Orbs:GetText():ToString(),
            }
        end)
        
        if ok and player then
            print(string.format("  > %s", player.name))
            table.insert(players, player)
        end
    end
    
    if #players > 0 then
        print(string.format("\n[PGSM] Successfully collected %d players!", #players))
        writeStats(players)
        statsCollected = true
        return true
    else
        print("[PGSM] No valid players found")
        return false
    end
end

-- Try to register MatchSummary hook (with polling)
print("Attempting to register MatchSummary hook...")

local function tryRegisterHook()
    if hookRegistered then return true end
    
    local success = pcall(function()
        RegisterHook(
            "/Game/Prometheus/Blueprints/Core/GameState_Game.GameState_Game_C:MatchSummary",
            function(self, MatchEventLog)
                print("\n")
                print("[PGSM] Match Summary Event Called!")
                print("[PGSM] Will start checking for stats in 10 seconds... (waiting for mvp screen to finish)")
                print("")
                
                statsCollected = false
                
                local attempts = 0
                local maxAttempts = 10
                
                local function tryCollect()
                    attempts = attempts + 1
                    print(string.format("\n[PGSM] Collection attempt %d/%d", attempts, maxAttempts))
                    
                    local success = collectStats()
                    
                    if not success and attempts < maxAttempts then
                        ExecuteWithDelay(10000, tryCollect) -- Try again in 10 seconds
                    elseif not success then
                        print("[PGSM] (!) Gave up after max attempts")
                    end
                end
                
                -- Wait 10 seconds before first attempt
                ExecuteWithDelay(10000, tryCollect)
            end
        )
    end)
    
    if success then
        hookRegistered = true
        print("[PGSM] MatchSummary hook registered successfully!")
        return true
    else
        return false
    end
end

-- Try immediately
if not tryRegisterHook() then
    print("[PGSM] Hook not available yet (not in a match)")
    print("[PGSM] Will retry every 30 seconds...")
    
    -- Retry every 30 seconds
    local retryCount = 0
    local function retry()
        retryCount = retryCount + 1
        print(string.format("\n[PGSM] Hook registration attempt #%d...", retryCount))
        
        if not tryRegisterHook() then
            ExecuteWithDelay(30000, retry) -- Retry every 30 seconds
        end
    end
    
    ExecuteWithDelay(30000, retry)
else
    print("[PGSM] Hook registered on startup (already in match)")
end