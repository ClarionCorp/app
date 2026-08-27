local Module = {}

-- Edits meta.json in place (evolving state, not a discrete event)
local LastSnapshot = ""

-- Per category keys so we can track which category changed to make it easier to parse later
local LastPartyKey = nil
local LastQueueKey = nil
local LastGameStateKey = nil
local LastCustomLobbyKey = nil

local MatchPhaseNames = {
    [0]="None",[1]="PreGame",[2]="CharacterSelect",[3]="FaceOffIntro",[4]="FaceOffCountdown",
    [5]="InGame",[6]="GoalCelebration",[7]="GoalScore",[8]="IntermissionIntro",[9]="Intermission",
    [10]="IntermissionOutro",[11]="PostGameCelebration",[12]="ArenaOverview",[13]="PostGameSummary",
    [14]="EndGame",[15]="LoadoutSelect",[16]="BoostSelect",[17]="TimeoutCelebration",
    [18]="VersusScreen",[19]="BanSelect",[20]="CharacterPreSelect",[21]="BanCelebration",[22]="IntermissionMvp",
}

local MatchmakingStateNames = {
    [0] = "Unknown", [1] = "Idle", [2] = "Queued", [3] = "FoundMatch",
    [4] = "StartingGame", [5] = "InGame",
}

local GameStateOld = nil
local GameStateNew = nil
local GameStateTimestamp = nil
local CachedQueueName = nil -- GetQueueName clears this once matchmaking is idle again

-- Tracks when the resolved queue name/state last actually changed
-- (not when it was last merely checked), same idea as GameStateTimestamp above.
local QueueTimestamp = nil
local LastQueueValue = nil
local HasCheckedQueue = false

-- PMMatchmakingUIData is a long-lived client-session singleton 
-- Cache the ref instead of FindFirstOf on every call, only re-fetching once it goes invalid.
local CachedMatchmakingUI = nil
local function GetMatchmakingUI()
    if not (CachedMatchmakingUI and CachedMatchmakingUI:IsValid()) then
        CachedMatchmakingUI = FindFirstOf("PMMatchmakingUIData")
    end
    return CachedMatchmakingUI
end

-- Returns (name, state)
-- Name is the resolved/fallback queue label.
-- State is the raw EMatchmakingStateV2 as a string (like "Queued").
local function GetQueueName()
    local mmState = 0
    pcall(function()
        local mmUI = GetMatchmakingUI()
        if mmUI and mmUI:IsValid() then
            mmState = mmUI:GetMatchmakingState()
        end
    end)

    if mmState == 1 then CachedQueueName = nil end

    local name = CachedQueueName or (mmState == 5 and "queue:custom:NvM" or nil)
    local stateName = MatchmakingStateNames[mmState] or tostring(mmState)

    local combined = tostring(name) .. "|" .. stateName
    if not HasCheckedQueue or combined ~= LastQueueValue then
        HasCheckedQueue = true
        LastQueueValue = combined
        QueueTimestamp = os.time()
    end
    return name, stateName
end

-- Custom-lobby info
local CustomLobbyName = nil
local CustomLobbyId = nil
local CustomLobbyIsPrivate = nil
local CustomLobbyRegions = nil
local CustomLobbyMemberCount = nil
local CustomLobbySize = nil

local function StringField(v)
    if v == nil then return nil end
    local ok, s = pcall(function() return v:ToString() end)
    if ok and s and s ~= "" then return s end
    if type(v) == "string" and v ~= "" then return v end
    return nil
end

-- FPlayerPublicProfile.MasteryLevel is a plain int32.
-- UPMPlayerUIData.Profile holds one of these directly,
-- so read level straight off that instead of FOdyUIIntBinding.
local function ReadPlayer(playerUI)
    if not playerUI or not playerUI:IsValid() then return nil end
    local ok, entry = pcall(function()
        local level = 0
        pcall(function()
            local profile = playerUI.Profile
            if profile then level = profile.MasteryLevel or 0 end
        end)
        return {
            player_id = StringField(playerUI.PlayerId) or "?",
            level = level,
        }
    end)
    return ok and entry or nil
end

-- PMGroupUIData is a long-lived client-session singleton.
-- Cache the ref instead of FindFirstOf on every call, only re-fetching once it goes invalid.
local CachedGroupUI = nil
local function GetGroupUI()
    if not (CachedGroupUI and CachedGroupUI:IsValid()) then
        CachedGroupUI = FindFirstOf("PMGroupUIData")
    end
    return CachedGroupUI
end

-- We assume that slot 0 is the local player, needs more testing
local function ReadParty()
    local partySize = 1
    local maxPartySize = 3
    local members = {}

    pcall(function()
        local groupUI = GetGroupUI()
        if not (groupUI and groupUI:IsValid()) then return end

        local max = groupUI.MaxGroupSize
        if max and max > 0 then maxPartySize = max end

        local list = groupUI.Members
        for i = 1, #list do
            pcall(function()
                local entry = ReadPlayer(list[i].Player)
                if entry and entry.player_id ~= "?" then
                    table.insert(members, entry)
                end
            end)
        end
        if #members > 0 then partySize = #members end
    end)

    for i, m in ipairs(members) do
        m.is_local = (i == 1)
    end

    return partySize, maxPartySize, members
end

local function WriteMeta(ModName, META_FILE)
    local partySize, maxPartySize, members = ReadParty()
    local localPlayerId = members[1] and members[1].player_id or nil
    local queueName, mmStateName = GetQueueName()

    local memberKey = ""
    for _, m in ipairs(members) do
        memberKey = memberKey .. m.player_id .. "|" .. tostring(m.level) .. ";"
    end
    local partyKey = tostring(localPlayerId) .. "|" .. tostring(partySize) .. "|" .. tostring(maxPartySize) .. "|" .. memberKey
    local queueKey = tostring(queueName) .. "|" .. mmStateName
    local gameStateKey = tostring(GameStateOld) .. "|" .. tostring(GameStateNew)
    local customLobbyKey = tostring(CustomLobbyId) .. "|" .. tostring(CustomLobbyName) .. "|" ..
        tostring(CustomLobbyIsPrivate) .. "|" .. table.concat(CustomLobbyRegions or {}, ",") .. "|" ..
        tostring(CustomLobbyMemberCount) .. "|" .. tostring(CustomLobbySize)
    local snapshot = partyKey .. "||" .. queueKey .. "||" .. gameStateKey .. "||" .. customLobbyKey

    if snapshot == LastSnapshot then return end
    LastSnapshot = snapshot

    -- Priority order when more than one category moved in the same write
    -- (e.g. a phase transition that also clears the queue)
    local lastChanged
    if gameStateKey ~= LastGameStateKey then
        lastChanged = "state"
    elseif queueKey ~= LastQueueKey then
        lastChanged = "queue"
    elseif customLobbyKey ~= LastCustomLobbyKey then
        lastChanged = "custom_lobby"
    else
        lastChanged = "party"
    end
    LastPartyKey = partyKey
    LastQueueKey = queueKey
    LastGameStateKey = gameStateKey
    LastCustomLobbyKey = customLobbyKey

    local localStr = localPlayerId and ('"' .. localPlayerId .. '"') or "null"
    local queueNameStr = queueName and ('"' .. queueName .. '"') or "null"
    local queueJson = string.format(
        '{"id":%s,"state":"%s","timestamp":%s}',
        queueNameStr, mmStateName, QueueTimestamp and tostring(QueueTimestamp) or "null"
    )

    local memberParts = {}
    for _, m in ipairs(members) do
        table.insert(memberParts, string.format(
            '    {"player_id":"%s","level":%d,"is_local":%s}',
            m.player_id, m.level, tostring(m.is_local)
        ))
    end
    local membersJson = (#memberParts > 0) and ("[\n" .. table.concat(memberParts, ",\n") .. "\n  ]") or "[]"

    local gameStateJson = "null"
    if GameStateOld and GameStateNew then
        gameStateJson = string.format(
            '{"old_phase":"%s","new_phase":"%s","timestamp":%d}', GameStateOld, GameStateNew, GameStateTimestamp
        )
    end

    local customLobbyJson = "null"
    if CustomLobbyId or CustomLobbyName then
        local regionParts = {}
        for _, r in ipairs(CustomLobbyRegions or {}) do
            table.insert(regionParts, '"' .. r .. '"')
        end
        customLobbyJson = string.format(
            '{"lobby_name":%s,"lobby_id":%s,"is_private":%s,"regions":[%s],"member_count":%s,"lobby_size":%s}',
            CustomLobbyName and ('"' .. CustomLobbyName .. '"') or "null",
            CustomLobbyId and ('"' .. CustomLobbyId .. '"') or "null",
            CustomLobbyIsPrivate == nil and "null" or tostring(CustomLobbyIsPrivate),
            table.concat(regionParts, ","),
            CustomLobbyMemberCount == nil and "null" or tostring(CustomLobbyMemberCount),
            CustomLobbySize == nil and "null" or tostring(CustomLobbySize)
        )
    end

    local body = string.format(
        '{\n  "last_changed": "%s",\n  "queue": %s,\n  "local_player": %s,\n  "party_size": %d,\n  "max_party_size": %d,\n  "party_members": %s,\n  "game_state": %s,\n  "custom_lobby": %s\n}\n',
        lastChanged, queueJson, localStr, partySize, maxPartySize, membersJson, gameStateJson, customLobbyJson
    )

    local writeStart = os.clock()
    local f = io.open(META_FILE, "w")
    if not f then print(string.format("[%s] Failed to write meta file\n", ModName)) return end
    f:write(body)
    f:close()
    local writeMs = (os.clock() - writeStart) * 1000
    print(string.format("[%s] Meta updated (party %d/%d, queue %s, reason=%s, write=%.1fms)\n",
        ModName, partySize, maxPartySize, tostring(queueName), lastChanged, writeMs))
end

function Module.Init(ModName, OUT_DIR)
    local META_FILE = OUT_DIR .. "\\meta.json"
    print(string.format("[%s] Writing meta to: %s\n", ModName, META_FILE))

    -- Queue name can change mid-menu with no phase transition at all,
    -- so write immediately on the matchmaking hook too, not just on phase change.
    pcall(function()
        RegisterHook("/Script/Prometheus.PMMatchmakingUIData:HandleMatchmakingStatusChanged",
            function(self, MatchmakingStatus)
                pcall(function()
                    local s = MatchmakingStatus:get()
                    local state = s.State
                    if state == 1 then
                        CachedQueueName = nil
                    elseif state == 2 then
                        local ok, v = pcall(function() return s.Queued.Queue:ToString() end)
                        if ok and v and v ~= "" and v ~= "None" then
                            CachedQueueName = v
                            print(string.format("[%s] Queuing for: %s", ModName, v))
                        end
                    end
                    WriteMeta(ModName, META_FILE)
                end)
            end
        )
        print(string.format("[%s] HandleMatchmakingStatusChanged hook registered\n", ModName))
    end)

    -- Sent when a custom lobby changes, both host and clients receive this
    pcall(function()
        RegisterHook("/Script/Prometheus.PMCustomLobbyUIData:OnCustomLobbyRosterResponseV1Notified",
            function(self, RosterResponseParam)
                pcall(function()
                    local resp = RosterResponseParam:get()
                    if not resp then return end

                    print(string.format("[%s] Checking custom lobby for changes...\n", ModName))

                    -- AllPlayerProfiles is everyone currently in the lobby (players + spectators)
                    local newName = StringField(resp.Name)
                    local okCount, newMemberCount = pcall(function() return #resp.AllPlayerProfiles end)
                    newMemberCount = okCount and newMemberCount or CustomLobbyMemberCount

                    -- If name or member count hasn't changed, bail before taking up any more of the thread
                    if newName == CustomLobbyName and newMemberCount == CustomLobbyMemberCount then
                        return
                    end
                    CustomLobbyName = newName
                    CustomLobbyMemberCount = newMemberCount

                    CustomLobbyId = StringField(resp.LobbyId)
                    local okPriv, requiresCode = pcall(function() return resp.RequiresJoinCode end)
                    CustomLobbyIsPrivate = okPriv and requiresCode or nil

                    local regions = {}
                    pcall(function()
                        local list = resp.AvailableServerRegions
                        for i = 1, #list do
                            local ok, name = pcall(function() return list[i]:ToString() end)
                            if ok and name and name ~= "" and name ~= "None" then
                                table.insert(regions, name)
                            end
                        end
                    end)
                    CustomLobbyRegions = regions

                    -- Team1Size/Team2Size are the game format's configured team sizes, not a live counter.
                    -- Their sum is lobby capacity, separate from member_count.
                    pcall(function() CustomLobbySize = (resp.Team1Size or 0) + (resp.Team2Size or 0) end)

                    print(string.format(
                        "[%s] Custom lobby roster notified: name=%s id=%s requires_join_code=%s regions=%s members=%s/%s\n",
                        ModName, tostring(CustomLobbyName), tostring(CustomLobbyId), tostring(CustomLobbyIsPrivate),
                        table.concat(regions, ","), tostring(CustomLobbyMemberCount), tostring(CustomLobbySize)
                    ))
                    WriteMeta(ModName, META_FILE)
                end)
            end
        )
        print(string.format("[%s] OnCustomLobbyRosterResponseV1Notified hook registered\n", ModName))
    end)

    -- Sent when the game state changes
    pcall(function()
        RegisterHook("/Script/Prometheus.PMPlayerControllerGame:MatchPhaseChanged",
            function(self, OldPhase, NewPhase)
                local calcStart = os.clock() -- performance.now() ahh
                local ok, err = pcall(function()
                    local oldPhase = OldPhase:get()
                    local newPhase = NewPhase:get()
                    GameStateOld = MatchPhaseNames[oldPhase] or tostring(oldPhase)
                    GameStateNew = MatchPhaseNames[newPhase] or tostring(newPhase)
                    GameStateTimestamp = os.time()
                    print(string.format("[%s] State: %s -> %s", ModName, GameStateOld, GameStateNew))

                    WriteMeta(ModName, META_FILE)
                end)
                local calcMs = (os.clock() - calcStart) * 1000
                print(string.format("[%s] [META] MatchPhaseChanged calc took %.2fms\n", ModName, calcMs))
                if not ok then print(string.format("[%s] Meta MatchPhaseChanged ERROR: %s\n", ModName, tostring(err))) end
            end
        )
        print(string.format("[%s] MatchPhaseChanged hook registered (game state + meta refetch)\n", ModName))
    end)

    -- Capture once on mod load too (hooks won't fire for the current state).
    ExecuteWithDelay(2000, function() pcall(function() WriteMeta(ModName, META_FILE) end) end)
end

return Module