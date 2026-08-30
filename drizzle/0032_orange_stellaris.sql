PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_gameSessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`startedAt` integer,
	`lastUpdated` integer,
	`active` integer DEFAULT true NOT NULL,
	`endOfMatchLPs` text DEFAULT '[]' NOT NULL,
	`matchHistories` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_gameSessions`("id", "startedAt", "lastUpdated", "active", "endOfMatchLPs", "matchHistories") SELECT "id", "startedAt", "lastUpdated", "active", "endOfMatchLPs", "matchHistories" FROM `gameSessions`;--> statement-breakpoint
DROP TABLE `gameSessions`;--> statement-breakpoint
ALTER TABLE `__new_gameSessions` RENAME TO `gameSessions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;