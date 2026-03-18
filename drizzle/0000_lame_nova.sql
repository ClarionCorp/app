CREATE TABLE `auth` (
	`id` integer PRIMARY KEY NOT NULL,
	`odyJwt` text NOT NULL,
	`odyRft` text NOT NULL,
	`ccJwt` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`rating` integer,
	`created_at` integer NOT NULL
);
