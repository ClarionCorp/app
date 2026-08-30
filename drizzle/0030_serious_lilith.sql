CREATE TABLE `gameSessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`startedAt` integer,
	`lastUpdated` integer,
	`endOfMatchLPs` integer DEFAULT '[]' NOT NULL,
	`matchHistories` integer DEFAULT '[]' NOT NULL
);
