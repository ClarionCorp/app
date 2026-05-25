local ModName = "GameSessionMod"
local ModVersion = "1.1.0"

print(string.format("\n=== %s v%s Loaded ===\n", ModName, ModVersion))

local SESSION_FILE = os.getenv("TEMP") .. "\\ue4ss_session.json"
print(string.format("[%s] Writing party to: %s", ModName, SESSION_FILE))

local cachedQueueName = nil
local lastWritten = {}

pcall(function()
    RegisterHook(
        "/Script/Prometheus.PMMatchmakingUIData:HandleMatchmakingStatusChanged",
        function(self, MatchmakingStatus)
            pcall(function()
                local s = MatchmakingStatus:get()
                local state = s.State
                if state == 1 then
                    cachedQueueName = nil
                elseif state == 2 then
                    local ok, v = pcall(function() return s.Queued.Queue:ToString() end)
                    if ok and v and v ~= "" and v ~= "None" then
                        cachedQueueName = v
                        print(string.format("[%s] Starting queuing for: %s", ModName, v))
                    end
                end
            end)
        end
    )
    print(string.format("[%s] HandleMatchmakingStatusChanged hook registered", ModName))
end)

local function LogPartyState()
    local GameState = FindFirstOf("PMGameState")
    local phase = GameState and GameState:IsValid() and GameState.CurrentMatchPhase or 0

    if phase == 0 or phase == 11 then
        local partySize = 1
        local maxPartySize = 3
        pcall(function()
            local groupUI = FindFirstOf("PMGroupUIData")
            if groupUI and groupUI:IsValid() then
                local max = groupUI.MaxGroupSize
                if max and max > 0 then maxPartySize = max end
                local members = groupUI.Members
                local count = 0
                for i = 1, #members do
                    pcall(function()
                        local player = members[i].Player
                        if player and player:IsValid() then
                            local id = player.PlayerId:ToString()
                            if id and id ~= "" and id ~= "None" then
                                count = count + 1
                            end
                        end
                    end)
                end
                if count > 0 then partySize = count end
            end
        end)

        local mmState = 0
        pcall(function()
            local mmUI = FindFirstOf("PMMatchmakingUIData")
            if mmUI and mmUI:IsValid() then
                mmState = mmUI:GetMatchmakingState()
            end
        end)

        if mmState == 1 then cachedQueueName = nil end

        local effectiveQueue = cachedQueueName or (mmState == 5 and "queue:custom:NvM" or nil)

        local cur = {
            partySize = partySize,
            maxPartySize = maxPartySize,
            mmState = mmState,
            queueName = effectiveQueue,
        }

        local changed = false
        for k, v in pairs(cur) do
            if lastWritten[k] ~= v then changed = true break end
        end

        if changed then
            lastWritten = cur
            local queueStr = effectiveQueue and ('"' .. effectiveQueue .. '"') or "null"
            local f = io.open(SESSION_FILE, "w")
            if f then
                f:write(string.format(
                    '{"party_size":%d,"max_party_size":%d,"mm_state":%d,"queue_name":%s,"timestamp":%d}\n',
                    partySize, maxPartySize, mmState, queueStr, os.time()
                ))
                f:close()
            end
        end
    end
    ExecuteWithDelay(1000, LogPartyState)
end

ExecuteWithDelay(3000, LogPartyState)