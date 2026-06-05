ALTER TABLE `matchPlayers` ADD `playerId` text;--> statement-breakpoint
CREATE UNIQUE INDEX `matchPlayers_playerId_unique` ON `matchPlayers` (`playerId`);