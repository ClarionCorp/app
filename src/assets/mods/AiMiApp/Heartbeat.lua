local Module = {}

local function WriteHeartbeat(ModName, HEARTBEAT_FILE, firstBoot)
    local body = string.format('{"timestamp": %d, "firstBoot": %s}\n', os.time(), tostring(firstBoot))

    local f = io.open(HEARTBEAT_FILE, "w")
    if not f then print(string.format("[%s] Failed to write heartbeat file\n", ModName)) return end
    f:write(body)
    f:close()
end

function Module.Init(ModName, OUT_DIR)
    local HEARTBEAT_FILE = OUT_DIR .. "\\heartbeat.json"
    -- print(string.format("[%s] Writing heartbeat to: %s\n", ModName, HEARTBEAT_FILE))

    local firstBoot = true
    local function Beat()
        pcall(function() WriteHeartbeat(ModName, HEARTBEAT_FILE, firstBoot) end)
        firstBoot = false
        ExecuteWithDelay(60000, Beat)
    end
    Beat()
end

return Module
