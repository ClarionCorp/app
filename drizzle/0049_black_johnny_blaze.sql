ALTER TABLE `onlinePlayers` ADD `queues` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `onlinePlayers` DROP COLUMN `in_your_queue`;