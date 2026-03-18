CREATE TABLE `currentMatch` (
	`id` integer PRIMARY KEY NOT NULL,
	`rawPhase` text,
	`myCharacter` text,
	`myTeam` text,
	`teamOnePts` integer,
	`teamTwoPts` integer,
	`teamOneSets` integer,
	`teamTwoSets` integer,
	`playerNames` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL
);
