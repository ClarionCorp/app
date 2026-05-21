local ModName = "GameStateMod"
local ModVersion = "1.0.0"

print(string.format("\n=== %s v%s Loaded ===\n", ModName, ModVersion))

local STATE_FILE = os.getenv("TEMP") .. "\\ue4ss_gamestate.json"
print(string.format("[%s] Writing state to: %s", ModName, STATE_FILE))

local MatchPhaseNames = {
    [0]="None",[1]="PreGame",[2]="CharacterSelect",[3]="FaceOffIntro",[4]="FaceOffCountdown",
    [5]="InGame",[6]="GoalCelebration",[7]="GoalScore",[8]="IntermissionIntro",[9]="Intermission",
    [10]="IntermissionOutro",[11]="PostGameCelebration",[12]="ArenaOverview",[13]="PostGameSummary",
    [14]="EndGame",[15]="LoadoutSelect",[16]="BoostSelect",[17]="TimeoutCelebration",
    [18]="VersusScreen",[19]="BanSelect",[20]="CharacterPreSelect",[21]="BanCelebration",[22]="IntermissionMvp",
}

local LastState = {}

local function GetLocalTeam()
    local PC = FindFirstOf("PMPlayerControllerGame")
    if PC and PC:IsValid() and PC.PlayerState and PC.PlayerState:IsValid() then
        local team = PC.PlayerState.AssignedTeam
        if team == 1 or team == 2 then return team end
    end
    return nil
end

local function WriteState(body)
    local f = io.open(STATE_FILE, "w")
    if not f then print("[" .. ModName .. "] Failed to write state file") return end
    f:write(body)
    f:close()
end

local function LogMatchState()
    local GameState = FindFirstOf("PMGameState")
    if GameState and GameState:IsValid() then
        local phase = GameState.CurrentMatchPhase
        local scoreInfo = GameState.MatchScoreInfo
        local t1 = scoreInfo.TeamOneInfo
        local t2 = scoreInfo.TeamTwoInfo
        local myTeam = GetLocalTeam()

        local cur = {
            phase  = phase,
            myTeam = myTeam,
            t1g    = t1.NumGoalsThisSet, t1s = t1.NumSetsThisMatch,
            t2g    = t2.NumGoalsThisSet, t2s = t2.NumSetsThisMatch,
        }

        local changed = false
        for k, v in pairs(cur) do
            if LastState[k] ~= v then changed = true break end
        end

        if changed then
            LastState = cur

            local phaseName = MatchPhaseNames[phase] or tostring(phase)

            print(string.format("\n========================================"))
            print(string.format("[%s] Phase: %s | Team: %s", ModName, phaseName, myTeam and ("Team "..myTeam) or "Unknown"))
            print(string.format("[%s] T1: %d goals, %d sets", ModName, t1.NumGoalsThisSet, t1.NumSetsThisMatch))
            print(string.format("[%s] T2: %d goals, %d sets", ModName, t2.NumGoalsThisSet, t2.NumSetsThisMatch))
            print(string.format("========================================\n"))

            WriteState(string.format(
                '{"phase":"%s","my_team":%s,"t1_goals":%d,"t1_sets":%d,"t2_goals":%d,"t2_sets":%d}',
                phaseName,
                myTeam and tostring(myTeam) or "null",
                t1.NumGoalsThisSet, t1.NumSetsThisMatch,
                t2.NumGoalsThisSet, t2.NumSetsThisMatch
            ))
        end
    end

    ExecuteWithDelay(3000, LogMatchState)
end

ExecuteWithDelay(3000, LogMatchState)
