CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`idempotency_key` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`query_type` text NOT NULL,
	`query_masked` text NOT NULL,
	`status` text DEFAULT 'awaiting_contact' NOT NULL,
	`consent_at` text NOT NULL,
	`created_at` text NOT NULL,
	`demo` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_idempotency_key_unique` ON `orders` (`idempotency_key`);