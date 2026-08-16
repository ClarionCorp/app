PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_matchPlayers` (
	`username` text PRIMARY KEY NOT NULL,
	`playerId` text NOT NULL,
	`teamNum` integer,
	`role` text,
	`charName` text,
	`charId` text,
	`rating` integer,
	`isMe` integer DEFAULT false NOT NULL,
	`xp` integer DEFAULT 0,
	`gainedXp` integer DEFAULT 0,
	`xpGoals` text DEFAULT '[]' NOT NULL,
	`ping` integer DEFAULT 0,
	`trainings` text DEFAULT '[]' NOT NULL,
	`favChar` text DEFAULT '[]' NOT NULL,
	`bestChar` text DEFAULT '[]' NOT NULL,
	`normWR` real,
	`rankedWR` real,
	`normGames` integer,
	`rankedGames` integer,
	`playstyle` text,
	`knockouts` integer,
	`smurfProbability` text DEFAULT 'none' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_matchPlayers`("username", "playerId", "teamNum", "role", "charName", "charId", "rating", "isMe", "xp", "gainedXp", "xpGoals", "ping", "trainings", "favChar", "bestChar", "normWR", "rankedWR", "normGames", "rankedGames", "playstyle", "knockouts", "smurfProbability") SELECT "username", "playerId", "teamNum", "role", "charName", "charId", "rating", "isMe", "xp", "gainedXp", "xpGoals", "ping", "trainings", "favChar", "bestChar", "normWR", "rankedWR", "normGames", "rankedGames", "playstyle", "knockouts", "smurfProbability" FROM `matchPlayers`;--> statement-breakpoint
DROP TABLE `matchPlayers`;--> statement-breakpoint
ALTER TABLE `__new_matchPlayers` RENAME TO `matchPlayers`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `matchPlayers_username_unique` ON `matchPlayers` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `matchPlayers_playerId_unique` ON `matchPlayers` (`playerId`);