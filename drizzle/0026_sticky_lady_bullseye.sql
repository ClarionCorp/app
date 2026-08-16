DROP TABLE `sessionInfo`;--> statement-breakpoint
ALTER TABLE `currentMatch` ADD `queueState` text;--> statement-breakpoint
ALTER TABLE `currentMatch` ADD `partySize` integer DEFAULT 0 NOT NULL;