ALTER TABLE `user` ADD `player_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `emoticon_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `nameplate_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `title_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `tags` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `mastery_level` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `player_status` text NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `display_name_status` text NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `last_display_name_change_timestamp` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `matchmaking_region` text NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `gamelift_region_urls` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `discord_id` text;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `created_at`;