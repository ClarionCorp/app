local ModName = "GameSessionMod"
local ModVersion = "1.0.0"

print(string.format("\n=== %s v%s Loaded ===\n", ModName, ModVersion))

local PARTY_FILE = os.getenv("TEMP") .. "\\ue4ss_party.json"
print(string.format("[%s] Writing party to: %s", ModName, PARTY_FILE))

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
        local f = io.open(PARTY_FILE, "w")
        if f then
            f:write(string.format('{"party_size":%d,"max_party_size":%d,"timestamp":%d}\n', partySize, maxPartySize, os.time()))
            f:close()
        end
    end
    ExecuteWithDelay(1000, LogPartyState)
end

ExecuteWithDelay(3000, LogPartyState)