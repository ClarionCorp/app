PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_matchHistory` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`mapId` text NOT NULL,
	`duration` integer NOT NULL,
	`queue` text NOT NULL,
	`bans` text DEFAULT '[]' NOT NULL,
	`playerId` text,
	`players` text DEFAULT '[]' NOT NULL,
	`t1_pts` integer DEFAULT 0 NOT NULL,
	`t2_pts` integer DEFAULT 0 NOT NULL,
	`t1_sets` integer DEFAULT 0 NOT NULL,
	`t2_sets` integer DEFAULT 0 NOT NULL,
	`myTeam` integer NOT NULL,
	`wonGame` integer NOT NULL,
	`validated` integer DEFAULT false NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_matchHistory`("id", "mapId", "duration", "queue", "bans", "playerId", "players", "t1_pts", "t2_pts", "t1_sets", "t2_sets", "myTeam", "wonGame", "validated", "createdAt") SELECT "id", "mapId", "duration", "queue", "bans", "playerId", "players", "t1_pts", "t2_pts", "t1_sets", "t2_sets", "myTeam", "wonGame", "validated", "createdAt" FROM `matchHistory`;--> statement-breakpoint
DROP TABLE `matchHistory`;--> statement-breakpoint
ALTER TABLE `__new_matchHistory` RENAME TO `matchHistory`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `matchPlayers` ADD `xpGoals` text DEFAULT '[]' NOT NULL;