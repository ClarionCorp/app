PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_currentMatch` (
	`id` integer PRIMARY KEY NOT NULL,
	`rawPhase` text NOT NULL,
	`level` text,
	`myCharacter` text,
	`myTeam` text,
	`teamOnePts` integer,
	`teamTwoPts` integer,
	`teamOneSets` integer,
	`teamTwoSets` integer,
	`playerNames` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_currentMatch`("id", "rawPhase", "level", "myCharacter", "myTeam", "teamOnePts", "teamTwoPts", "teamOneSets", "teamTwoSets", "playerNames", "created_at") SELECT "id", "rawPhase", "level", "myCharacter", "myTeam", "teamOnePts", "teamTwoPts", "teamOneSets", "teamTwoSets", "playerNames", "created_at" FROM `currentMatch`;--> statement-breakpoint
DROP TABLE `currentMatch`;--> statement-breakpoint
ALTER TABLE `__new_currentMatch` RENAME TO `currentMatch`;--> statement-breakpoint
PRAGMA foreign_keys=ON;