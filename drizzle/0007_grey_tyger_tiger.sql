PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`player_id` text NOT NULL,
	`emoticon_id` text NOT NULL,
	`nameplate_id` text NOT NULL,
	`title_id` text NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`mastery_level` integer NOT NULL,
	`player_status` text NOT NULL,
	`display_name_status` text NOT NULL,
	`last_display_name_change_timestamp` integer,
	`matchmaking_region` text NOT NULL,
	`gamelift_region_urls` text DEFAULT '[]' NOT NULL,
	`discord_id` text,
	`rating` integer,
	`region` text,
	`active` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_user`("id", "username", "player_id", "emoticon_id", "nameplate_id", "title_id", "tags", "mastery_level", "player_status", "display_name_status", "last_display_name_change_timestamp", "matchmaking_region", "gamelift_region_urls", "discord_id", "rating", "region", "active") SELECT "id", "username", "player_id", "emoticon_id", "nameplate_id", "title_id", "tags", "mastery_level", "player_status", "display_name_status", "last_display_name_change_timestamp", "matchmaking_region", "gamelift_region_urls", "discord_id", "rating", "region", "active" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;