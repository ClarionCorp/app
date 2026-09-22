CREATE TABLE `onlinePlayers` (
	`id` integer PRIMARY KEY NOT NULL,
	`total` integer DEFAULT 0 NOT NULL,
	`in_game` integer DEFAULT 0 NOT NULL,
	`idling` integer DEFAULT 0 NOT NULL,
	`seen` integer DEFAULT 0 NOT NULL,
	`in_your_queue` integer,
	`lastUpdated` integer
);
