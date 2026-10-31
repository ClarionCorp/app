local Refs = {}

-- Weak UObject references that can't outlive GC.
-- Only the object's path (a plain string) is kept between calls, never the UObject itself.
-- A cached UObject that gets garbage collected crashes on the next :IsValid().
local WeakRef = {}
WeakRef.__index = WeakRef

local function PathOf(obj)
    local ok, full = pcall(function() return obj:GetFullName() end)
    if not ok or not full then return nil end
    local path = full:match("^%S+%s+(.+)$") -- strip the leading class name
    if not path or path:find("Default__", 1, true) then return nil end -- skip CDOs
    return path
end

function Refs.New(className)
    return setmetatable({ className = className, path = nil }, WeakRef)
end

-- Only pass objects that are known live right now (hook args, NotifyOnNewObject, a fresh lookup).
function WeakRef:Set(obj)
    self.path = (obj and obj:IsValid()) and PathOf(obj) or nil
end

-- allowFind: fall back to one FindFirstOf when the cached path no longer resolves.
-- Never pass true from a timer, only from infrequent events (hooks, mod load).
function WeakRef:Get(allowFind)
    if self.path then
        local obj = StaticFindObject(self.path)
        if obj and obj:IsValid() then return obj end
        self.path = nil
    end
    if allowFind then
        local obj = FindFirstOf(self.className)
        if obj and obj:IsValid() then
            self:Set(obj)
            return obj
        end
    end
    return nil
end

-- PMGameState is shared by Players (PlayerArray) and Match (score/map/bans).
-- Grab its path as soon as it's constructed so nothing has to search for it.
Refs.GameState = Refs.New("PMGameState")
pcall(function()
    NotifyOnNewObject("/Script/Prometheus.PMGameState", function(gs)
        Refs.GameState:Set(gs)
    end)
end)

return Refs
