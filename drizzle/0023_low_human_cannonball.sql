CREATE TABLE `seenDialogues` (
	`id` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	`updated_at` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `seenDialogues_id_unique` ON `seenDialogues` (`id`);