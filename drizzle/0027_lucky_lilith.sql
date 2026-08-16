CREATE TABLE `customLobby` (
	`id` integer PRIMARY KEY NOT NULL,
	`lobbyName` text,
	`lobbyId` text,
	`private` text,
	`serverIds` text,
	`region` integer,
	`appBlocked` integer DEFAULT false NOT NULL,
	`maxMembers` integer DEFAULT 0 NOT NULL,
	`memberCount` integer DEFAULT 0 NOT NULL,
	`lastUpdated` integer
);
