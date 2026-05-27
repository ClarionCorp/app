CREATE TABLE `appSettings` (
	`id` integer PRIMARY KEY NOT NULL,
	`gameDirectory` text,
	`drpcEnabled` integer DEFAULT true NOT NULL,
	`notifyQueuePop` integer DEFAULT false NOT NULL,
	`queuePopVol` integer DEFAULT 50 NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `auth` (
	`id` integer PRIMARY KEY NOT NULL,
	`odyJwt` text NOT NULL,
	`odyRft` text NOT NULL,
	`ccJwt` text,
	`appId` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `currentMatch` (
	`id` integer PRIMARY KEY NOT NULL,
	`gameState` text,
	`map` text,
	`queue` text,
	`teamNum` integer,
	`trainings` text DEFAULT '[]' NOT NULL,
	`teamOnePts` integer,
	`teamTwoPts` integer,
	`teamOneSets` integer,
	`teamTwoSets` integer,
	`startedAt` integer
);
--> statement-breakpoint
CREATE TABLE `matchHistory` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`mapId` text NOT NULL,
	`duration` integer NOT NULL,
	`queue` text NOT NULL,
	`players` text DEFAULT '[]' NOT NULL,
	`t1_sets` integer NOT NULL,
	`t2_sets` integer NOT NULL,
	`myTeam` integer NOT NULL,
	`wonGame` integer NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `matchPlayers` (
	`username` text PRIMARY KEY NOT NULL,
	`teamNum` integer,
	`role` text,
	`charName` text,
	`charId` text,
	`rating` integer,
	`isMe` integer DEFAULT false NOT NULL,
	`xp` integer DEFAULT 0,
	`trainings` text DEFAULT '[]' NOT NULL,
	`favChar` text DEFAULT '[]' NOT NULL,
	`bestChar` text DEFAULT '[]' NOT NULL,
	`normWR` real,
	`rankedWR` real,
	`normGames` integer,
	`rankedGames` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `matchPlayers_username_unique` ON `matchPlayers` (`username`);--> statement-breakpoint
CREATE TABLE `sessionInfo` (
	`id` integer PRIMARY KEY NOT NULL,
	`partySize` integer DEFAULT 0 NOT NULL,
	`maxPartySize` integer DEFAULT 3 NOT NULL,
	`queueState` text,
	`queueName` text
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY NOT NULL,
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
	`rating` integer
);
