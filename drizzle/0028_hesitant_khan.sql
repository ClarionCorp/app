PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_customLobby` (
	`id` integer PRIMARY KEY NOT NULL,
	`lobbyName` text,
	`lobbyId` text,
	`private` integer DEFAULT false NOT NULL,
	`serverIds` text,
	`region` text,
	`appBlocked` integer DEFAULT false NOT NULL,
	`maxMembers` integer DEFAULT 0 NOT NULL,
	`memberCount` integer DEFAULT 0 NOT NULL,
	`lastUpdated` integer
);
--> statement-breakpoint
INSERT INTO `__new_customLobby`("id", "lobbyName", "lobbyId", "private", "serverIds", "region", "appBlocked", "maxMembers", "memberCount", "lastUpdated") SELECT "id", "lobbyName", "lobbyId", "private", "serverIds", "region", "appBlocked", "maxMembers", "memberCount", "lastUpdated" FROM `customLobby`;--> statement-breakpoint
DROP TABLE `customLobby`;--> statement-breakpoint
ALTER TABLE `__new_customLobby` RENAME TO `customLobby`;--> statement-breakpoint
PRAGMA foreign_keys=ON;