export type TrainingInfo = {
  awakeningId: string,
  image: string,
  name: string,
  description: string,
  gear?: boolean,
  disabled?: boolean,
}

export const TRAININGS: Record<string, TrainingInfo> = {
  "TD_AvoidDamageHitHarder": {
    awakeningId: "T_GlassCannon",
    image: "/trainings/TD_AvoidDamageHitHarder.webp",
    name: "Glass Cannon",
    description: "Avoid being hit to gain Power and Speed"
  },
  "TD_AvoidHittingGainSpeed": {
    awakeningId: "",
    image: "/trainings/TD_AvoidHittingGainSpeed.webp",
    name: "Pacifist",
    description: "Avoid hitting enemies to gain ramping speed",
    disabled: true
  },
  "TD_AvoidKnockoutGainSpeed": {
    awakeningId: "T_OmegaInfusedAccelerator",
    image: "/trainings/TD_AvoidKnockoutGainSpeed.webp",
    name: "Omega Infused Accelerator", // Pacifist
    description: "Slowly gain Speed and lose Max Stagger until either the round ends or you get knocked out."
  },
  "TD_BarrierBuff": {
    awakeningId: "T_Demolitionist",
    image: "/trainings/TD_BarrierBuff.webp",
    name: "Demolitionist",
    description: "Gain Size. Destroy barriers to reduce cooldowns"
  },
  "TD_BaseStaggerAndRegen": {
    awakeningId: "T_ClarionCorpRegenerator",
    image: "/trainings/TD_BaseStaggerAndRegen.webp",
    name: "Clarion Corp. Regenerator",
    description: "Gain Stagger and heal when striking the core"
  },
  "TD_BlessingCooldownRate": {
    awakeningId: "T_SparkofFocus",
    image: "/trainings/TD_BlessingCooldownRate.webp",
    name: "Spark of Focus",
    description: "Increased Cooldown Rate. More per SPARK effect."
  },
  "TD_BlessingMaxStagger": {
    awakeningId: "T_SparkofResilience",
    image: "/trainings/TD_BlessingMaxStagger.webp",
    name: "Spark of Resilience",
    description: "Increased Stagger. More per SPARK effect."
  },
  "TD_BlessingPower": {
    awakeningId: "T_SparkofStrength",
    image: "/trainings/TD_BlessingPower.webp",
    name: "Spark of Strength",
    description: "Increased Power. More per SPARK effect."
  },
  "TD_BlessingShare": {
    awakeningId: "T_SparkofLeadership",
    image: "/trainings/TD_BlessingShare.webp",
    name: "Spark of Leadership",
    description: "Increase all stats a small amount. Share SPARK effects with allies."
  },
  "TD_BlessingSpeed": {
    awakeningId: "T_SparkofAgility",
    image: "/trainings/TD_BlessingSpeed.webp",
    name: "Spark of Agility",
    description: "Increased Speed. More per SPARK effect."
  },
  "TD_BuffAndDebuffDuration": {
    awakeningId: "T_CastToLast",
    image: "/trainings/TD_BuffAndDebuffDuration.webp",
    name: "Cast to Last",
    description: "BUFFS, DEBUFFS, and CREATIONS last longer"
  },
  "TD_ComboATarget": {
    awakeningId: "T_OneTwoPunch",
    image: "/trainings/TD_ComboATarget.webp",
    name: "One-Two Punch",
    description: "Consecutive attacks hit harder"
  },
  "TD_CounterStrikeCD": {
    awakeningId: "",
    image: "/trainings/TD_CounterStrikeCD.webp",
    name: "Tactician",
    description: "Reduce your cooldowns whenever you SNAP STRIKE",
    disabled: true
  },
  "TD_CounterStrikeHitPower": {
    awakeningId: "",
    image: "/trainings/TD_CounterStrikeHitPower.webp",
    name: "Heavy Handed",
    description: "Hit the Core harder. COUNTER STRIKING hits the much harder and grants a burst of speed.",
    disabled: true
  },
  "TD_CounterStrikeSpeed": {
    awakeningId: "",
    image: "/trainings/TD_CounterStrikeSpeed.webp",
    name: "Quick Reflexes",
    description: "Gain a burst of speed whenever you SNAP STRIKE",
    disabled: true
  },
  "TD_CreationLifeTime": {
    awakeningId: "",
    image: "/trainings/TD_CreationLifeTime.webp",
    name: "Creator of Durable Things",
    description: "CREATIONS gain duration and they hit harder",
    disabled: true
  },
  "TD_CreationSize": {
    awakeningId: "T_Monumentalist",
    image: "/trainings/TD_CreationSize.webp",
    name: "Monumentalist",
    description: "CREATIONS gain size and they hit harder"
  },
  "TD_CreationSizeLifeTime": {
    awakeningId: "T_TimelessCreator",
    image: "/trainings/TD_CreationSizeLifeTime.webp",
    name: "Timeless Creator",
    description: "CREATIONS gain duration and size"
  },
  "TD_DistancePower": {
    awakeningId: "T_DeadEye",
    image: "/trainings/TD_DistancePower.webp",
    name: "Deadeye",
    description: "Stronger ranged hits"
  },
  "TD_EdgePower": {
    awakeningId: "T_KnifesEdge",
    image: "/trainings/TD_EdgePower.webp",
    name: "Knife's Edge",
    description: "Gain Power and Speed near Arena edges"
  },
  "TD_EmpoweredHitsBuff": {
    awakeningId: "T_ImpactSpecialist",
    image: "/trainings/TD_EmpoweredHitsBuff.webp",
    name: "Specialized Training",
    description: "Empowered SPECIAL"
  },
  "TD_EnergyCatalyst": {
    awakeningId: "T_Catalyst",
    image: "/trainings/TD_EnergyCatalyst.webp",
    name: "Catalyst",
    description: "Increased Energy gains on hit and when being hit."
  },
  "TD_EnergyConversion": {
    awakeningId: "T_Egoist",
    image: "/trainings/TD_EnergyConversion.webp",
    name: "Egoist",
    description: "Restore some Energy after using it. Gain dramatic Speed at max Energy."
  },
  "TD_EnergyDischarge": {
    awakeningId: "T_FireUp",
    image: "/trainings/TD_EnergyDischarge.webp",
    name: "Fire Up!",
    description: "Begin rounds with more Energy. Speed up on Energy use and  grant Energy to allies."
  },
  "TD_EnhancedOrbsCooldown": {
    awakeningId: "T_OrbPonderer",
    image: "/trainings/TD_EnhancedOrbsCooldown.webp",
    name: "Orb Ponderer",
    description: "Power Orbs reduce cooldowns"
  },
  "TD_EnhancedOrbsPower": {
    awakeningId: "",
    image: "/trainings/TD_EnhancedOrbsPower.webp",
    name: "Orb Smasher",
    description: "Orbs grant temporary Power, stacking",
    disabled: true
  },
  "TD_EnhancedOrbsSpeed": {
    awakeningId: "T_OrbDancer",
    image: "/trainings/TD_EnhancedOrbsSpeed.webp",
    name: "Orb Dancer",
    description: "Power Orbs grant a Speed boost"
  },
  "TD_FasterDashes": {
    awakeningId: "T_SuperSurge",
    image: "/trainings/TD_FasterDashes.webp",
    name: "Super Surge",
    description: "Enhanced and harder hitting DASH, BLINK, and HASTE abilities."
  },
  "TD_FasterDashes2": {
    awakeningId: "T_Chronoboost",
    image: "/trainings/TD_FasterDashes2.webp",
    name: "Chronoboost",
    description: "Enhanced DASH, BLINK, and HASTE abilities. Extended BUFFS and DEBUFFS."
  },
  "TD_FasterDashes3": {
    awakeningId: "T_ExplosiveEntrance",
    image: "/trainings/TD_FasterDashes3.webp",
    name: "Explosive Entrance",
    description: "Enhanced DASH, BLINK, and HASTE abilities. IMPACTS hit harder"
  },
  "TD_FasterProjectiles": {
    awakeningId: "T_MissilePropulsion",
    image: "/trainings/TD_FasterProjectiles.webp",
    name: "Missile Propulsion",
    description: "Longer range PROJECTILES"
  },
  "TD_FasterProjectiles2": {
    awakeningId: "T_Aerials",
    image: "/trainings/TD_FasterProjectiles2.webp",
    name: "Aerials",
    description: "Enhanced DASH, BLINK, and HASTE abilities. Longer range PROJECTILES. "
  },
  "TD_FasterProjectiles3": {
    awakeningId: "T_SiegeMachine",
    image: "/trainings/TD_FasterProjectiles3.webp",
    name: "Siege Machine",
    description: "Longer range PROJECTILES. CREATIONS gain duration and hit harder."
  },
  "TD_GainRampingSpeed": {
    awakeningId: "T_MomentumBoots",
    image: "/trainings/TD_GainRampingSpeed.webp",
    name: "Momentum Boots",
    description: "Gain ramping Speed between hits",
    gear: true
  },
  "TD_GainSpeedInDirection": {
    awakeningId: "",
    image: "/trainings/TD_GainSpeedInDirection.webp",
    name: "Steam Train",
    description: "Gain speed. Moving in the same direction increases your momentum",
    disabled: true
  },
  "TD_GainSpeedNearAllies": {
    awakeningId: "",
    image: "/trainings/TD_GainSpeedNearAllies.webp",
    name: "Duet",
    description: "Gain Ramping speed when not near teammates. Touch allies grant both of you a burst of speed.",
    disabled: true
  },
  "TD_GainSpeedWhenNotHit": {
    awakeningId: "",
    image: "/trainings/TD_GainSpeedWhenNotHit.webp",
    name: "",
    description: "Gain HASTE until hit.",
    disabled: true
  },
  "TD_GoalArcPower": {
    awakeningId: "T_PowerhousePauldrons",
    image: "/trainings/TD_GoalArcPower.webp",
    name: "Powerhouse Pauldrons",
    description: "Gain Size, Power, and Defense",
    gear: true
  },
  "TD_HitAnythingRestoreStagger": {
    awakeningId: "T_TempoSwings",
    image: "/trainings/TD_HitAnythingRestoreStagger.webp",
    name: "Tempo Swing",
    description: "Hits deal bonus damage and heal"
  },
  "TD_HitCoreGainCDR": {
    awakeningId: "T_InnerFocus",
    image: "/trainings/TD_HitCoreGainCDR.webp",
    name: "Inner Focus",
    description: "Hits grant stacking Cooldown Rate; lost if K.O.'d"
  },
  "TD_HitEnemyBurnThem": {
    awakeningId: "T_Stinger",
    image: "/trainings/TD_HitEnemyBurnThem.webp",
    name: "Stinger",
    description: "Hits deal bonus damage over time"
  },
  "TD_HitEnemyDrainThem": {
    awakeningId: "T_NanotechSiphoningWand",
    image: "/trainings/TD_HitEnemyDrainThem.webp",
    name: "Siphoning Wand",
    description: "Hits damage enemies over time and heal the user over time.",
    gear: true
  },
  "TD_HitEnemySlowThem": {
    awakeningId: "",
    image: "/trainings/TD_HitEnemySlowThem.webp",
    name: "",
    description: "HEAVY hits slow enemies",
    disabled: true
  },
  "TD_HitRockCooldown": {
    awakeningId: "T_HotShot",
    image: "/trainings/TD_HitRockCooldown.webp",
    name: "Hotshot",
    description: "Hit the Core harder. Hitting the Core reduces cooldowns."
  },
  "TD_HitsIncreaseSpeedAndPower": {
    awakeningId: "T_StacksOnStacks",
    image: "/trainings/TD_HitsIncreaseSpeedAndPower.webp",
    name: "Stacks on Stacks",
    description: "Hits grant stacking Speed; lost if K.O.'d"
  },
  "TD_HitSpeed": {
    awakeningId: "T_FightorFlight",
    image: "/trainings/TD_HitSpeed.webp",
    name: "Fight or Flight",
    description: "Hits grant Speed. Staggering hits refresh SECONDARY"
  },
  "TD_HitsReduceCooldowns": {
    awakeningId: "T_PerfectForm",
    image: "/trainings/TD_HitsReduceCooldowns.webp",
    name: "Perfect Form",
    description: "Hits reduce cooldowns"
  },
  "TD_HitStaggerEnemyCooldownReduction": {
    awakeningId: "T_Pummelers",
    image: "/trainings/TD_HitStaggerEnemyCooldownReduction.webp",
    name: "Pummelers",
    description: "Increased player knockback. Gain Speed with a Striker advantage.",
    gear: true
  },
  "TD_IncreasedPlayerKnockback": {
    awakeningId: "",
    image: "/trainings/TD_IncreasedPlayerKnockback.webp",
    name: "",
    description: "Increased knockback against players",
    disabled: true
  },
  "TD_IncreasedPowerWithMaxStagger": {
    awakeningId: "",
    image: "/trainings/TD_IncreasedPowerWithMaxStagger.webp",
    name: "Unstoppable",
    description: "Gain massive knockback resistance and some damage reduction while not Staggered.",
    disabled: true
  },
  "TD_IncreasedSpeedCrossingMidfield": {
    awakeningId: "T_MagneticSoles",
    image: "/trainings/TD_IncreasedSpeedCrossingMidfield.webp",
    name: "Magnetized Soles",
    description: "Crossing Midfield grants Speed",
    gear: true
  },
  "TD_IncreasedSpeedWithStagger": {
    awakeningId: "T_StaggerSwagger",
    image: "/trainings/TD_IncreasedSpeedWithStagger.webp",
    name: "Stagger Swagger",
    description: "Gain some Speed. While heavily damaged, gain massive Speed and Regen."
  },
  "TD_IncreasedStatsWhileStaggered": {
    awakeningId: "T_Berserker",
    image: "/trainings/TD_IncreasedStatsWhileStaggered.webp",
    name: "Berserker",
    description: "Gain Power, Cooldown Rate, and Speed while you are damaged. Gain even more while staggered"
  },
  "TD_KnockAnythingRecoverStagger": {
    awakeningId: "T_ViciousVambrace",
    image: "/trainings/TD_KnockAnythingRecoverStagger.webp",
    name: "Vicious Vambrace",
    description: "Heal based on damage dealt",
    gear: true
  },
  "TD_KOKing": {
    awakeningId: "T_PrizeFighter",
    image: "/trainings/TD_KOKing.webp",
    name: "Prize Fighter",
    description: "Takedowns grant stacking Power; lost if K.O.'d"
  },
  "TD_LevelUpSpeedUp": {
    awakeningId: "",
    image: "/trainings/TD_LevelUpSpeedUp.webp",
    name: "Adrenaline Rush",
    description: "Shorter cooldowns. Takedowns grant speed and reduced cooldowns.",
    disabled: true
  },
  "TD_MaxStaggerIncrease": {
    awakeningId: "",
    image: "/trainings/TD_MaxStaggerIncrease.webp",
    name: "Big Fish",
    description: "Gain Size and Stagger",
    disabled: true
  },
  "TD_MovementAbilitiesEmpowerStrike": {
    awakeningId: "",
    image: "/trainings/TD_MovementAbilitiesEmpowerStrike.webp",
    name: "",
    description: "MOVEMENT abilities empower Strike",
    disabled: true
  },
  "TD_MovementAbilitiesTeleport": {
    awakeningId: "T_EjectButton",
    image: "/trainings/TD_MovementAbilitiesTeleport.webp",
    name: "Eject Button",
    description: "Enhanced MOVEMENT/SECONDARY abilities. Recast SECONDARY to BLINK back.",
    gear: true
  },
  "TD_MovementAbilityCharges": {
    awakeningId: "T_TwinDrive",
    image: "/trainings/TD_MovementAbilityCharges.webp",
    name: "Twin Drive",
    description: "More frequent SECONDARY"
  },
  "TD_MultiHitsReduceCooldowns": {
    awakeningId: "T_ShockAndAwe",
    image: "/trainings/TD_MultiHitsReduceCooldowns.webp",
    name: "Heavy Impact",
    description: "IMPACTS hit harder. Multi-hits refund cooldowns."
  },
  "TD_OrbEffectsIncreased": {
    awakeningId: "",
    image: "/trainings/TD_OrbEffectsIncreased.webp",
    name: "Orb Enjoyer",
    description: "Orbs grant increased energy",
    disabled: true
  },
  "TD_OrbShare": {
    awakeningId: "T_OrbSharer",
    image: "/trainings/TD_OrbShare.webp",
    name: "Orb Replicator",
    description: "Share Power Orb benefits with allies"
  },
  "TD_PrimaryAbilityCooldownReduction": {
    awakeningId: "T_RapidFire",
    image: "/trainings/TD_PrimaryAbilityCooldownReduction.webp",
    name: "Rapid Fire",
    description: "PRIMARY cooldown reduced"
  },
  "TD_PrimaryEcho": {
    awakeningId: "T_PrimeTime",
    image: "/trainings/TD_PrimaryEcho.webp",
    name: "Primetime",
    description: "PRIMARY gains +1 charge but hits weaker"
  },
  "TD_RangedStrike": {
    awakeningId: "T_StrikeShot",
    image: "/trainings/TD_RangedStrike.webp",
    name: "Strike Shot",
    description: "Longer range PROJECTILES. Strikes periodically launch a PROJECTILE",
    gear: true
  },
  "TD_ResetPrimaryOnStagger": {
    awakeningId: "",
    image: "/trainings/TD_ResetPrimaryOnStagger.webp",
    name: "",
    description: "Staggering opponents resets PRIMARY ability.",
    disabled: true
  },
  "TD_ResistFirstHit": {
    awakeningId: "T_Unstoppable",
    image: "/trainings/TD_ResistFirstHit.webp",
    name: "Unstoppable",
    description: "Periodically gain a shield that protects you from the first hit you would take"
  },
  "TD_Revive": {
    awakeningId: "T_PocketPolly",
    image: "/trainings/TD_Revive.webp",
    name: "Recovery Drone", // "Second Wind"
    description: "Gain Size. Prevent the first time you would be KO'd each set"
  },
  "TD_ShrinkSelfGrowAllies": {
    awakeningId: "T_AmongTitans",
    image: "/trainings/TD_ShrinkSelfGrowAllies.webp",
    name: "Among Titans",
    description: "Lose Size but gain Speed. Your teammates gain Size."
  },
  "TD_SizeIncrease": {
    awakeningId: "T_BuiltDifferent",
    image: "/trainings/TD_SizeIncrease.webp",
    name: "Built Different",
    description: "Gain Size and harder hitting IMPACTS"
  },
  "TD_SizeIncrease2": {
    awakeningId: "T_BigFish",
    image: "/trainings/TD_SizeIncrease2.webp",
    name: "Big Fish",
    description: "Gain Size and Stagger"
  },
  "TD_SizePowerConversion": {
    awakeningId: "T_MightOfTheColossus",
    image: "/trainings/TD_SizePowerConversion.webp",
    name: "Might of the Colossus",
    description: "Increased Size. Increased Power from Size."
  },
  "TD_SpecialCooldownAfterRounds": {
    awakeningId: "T_ExtraSpecial",
    image: "/trainings/TD_SpecialCooldownAfterRounds.webp",
    name: "Extra Special",
    description: "Enhanced SPECIAL cooldown"
  },
  "TD_SpecialGrantsShield": {
    awakeningId: "",
    image: "/trainings/TD_SpecialGrantsShield.webp",
    name: "",
    description: "SPECIAL grants a shield",
    disabled: true
  },
  "TD_StackingSize": {
    awakeningId: "T_Rampage",
    image: "/trainings/TD_StackingSize.webp",
    name: "Rampage",
    description: "Gain Size. Destroy barriers to gain more; additional size lost if KO'd"
  },
  "TD_StaggerCooldownRateConversion": {
    awakeningId: "T_Reverberation",
    image: "/trainings/TD_StaggerCooldownRateConversion.webp",
    name: "Reverberation",
    description: "Increased Stagger. Increased Cooldown Rate from Stagger."
  },
  "TD_StaggerPowerConversion": {
    awakeningId: "T_BulkUp",
    image: "/trainings/TD_StaggerPowerConversion.webp",
    name: "Bulk Up",
    description: "Increased Stagger. Increased power from Stagger."
  },
  "TD_StaggerSpeedConversion": {
    awakeningId: "T_PeakPerformance",
    image: "/trainings/TD_StaggerSpeedConversion.webp",
    name: "Peak Performance",
    description: "Gain Stagger. Increased Speed from Stagger."
  },
  "TD_StrikeCooldownReduction": {
    awakeningId: "T_QuickStrike",
    image: "/trainings/TD_StrikeCooldownReduction.webp",
    name: "Quick Strike",
    description: "Strike cooldown reduced. Strike hits grant additional energy."
  },
  "TD_StrikeRockHarderInCourt": {
    awakeningId: "",
    image: "/trainings/TD_StrikeRockHarderInCourt.webp",
    name: "",
    description: "Better hits on your side of field",
    disabled: true
  },
  "TD_StrikeRockSpeedUp": {
    awakeningId: "T_SlickKicks",
    image: "/trainings/TD_StrikeRockSpeedUp.webp",
    name: "Slick Kicks",
    description: "Strikes grant HASTE",
    gear: true
  },
  "TD_StrikeRockTowardsAllies": {
    awakeningId: "T_TeamPlayer",
    image: "/trainings/TD_StrikeRockTowardsAllies.webp",
    name: "Team Player",
    description: "Strike the Core Harder towards allies. That Ally can strike the core faster and pass the buff along."
  },
  "TD_TakedownGoalAssistLevels": {
    awakeningId: "",
    image: "/trainings/TD_TakedownGoalAssistLevels.webp",
    name: "",
    description: "Extra early levels",
    disabled: true
  },
  "TD_TakeDownReduceCooldowns": {
    awakeningId: "T_AdrenalineRush",
    image: "/trainings/TD_TakeDownReduceCooldowns.webp",
    name: "Adrenaline Rush",
    description: "Shorter cooldowns. Takedowns grant speed and reduced cooldowns.",
  },
  "TD_Template": {
    awakeningId: "",
    image: "/trainings/TD_Template.webp",
    name: "",
    description: "",
    disabled: true
  },
  "TD_TrapMaster": {
    awakeningId: "",
    image: "/trainings/TD_TrapMaster.webp",
    name: "",
    description: "CREATE a trap on long range hits",
    disabled: true
  }
};


export function getTrainingInfo(id: string): TrainingInfo | undefined {
  return TRAININGS[id];
}
