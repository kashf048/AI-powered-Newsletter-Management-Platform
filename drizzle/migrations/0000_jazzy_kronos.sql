CREATE TABLE `admins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` text,
	`avatarUrl` varchar(500),
	`isSuperadmin` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admins_id` PRIMARY KEY(`id`),
	CONSTRAINT `admins_openId_unique` UNIQUE(`openId`),
	CONSTRAINT `admins_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `aiGenerations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`issueId` int,
	`toolType` enum('full_issue_writer','section_writer','subject_line_generator','email_rewriter','news_summarizer','pakistan_angle_finder','prompt_creator','sponsor_ad_writer','headline_optimizer','chat_assistant') NOT NULL,
	`inputData` json,
	`promptUsed` text,
	`aiResponse` text,
	`modelUsed` varchar(100),
	`tokensUsed` int DEFAULT 0,
	`generationTimeMs` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiGenerations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subscriberId` int NOT NULL,
	`issueId` int,
	`eventType` enum('sent','delivered','opened','clicked','bounced','complained','unsubscribed') NOT NULL,
	`linkUrl` varchar(500),
	`ipAddress` varchar(45),
	`userAgent` varchar(500),
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	`rawPayload` json,
	CONSTRAINT `emailEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `issueSections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`issueId` int NOT NULL,
	`sectionType` enum('news_roundup','tool_of_week','pakistan_spotlight','deep_dive','prompt_of_week','sponsor_slot','quick_bites','community','jobs','custom') NOT NULL,
	`title` varchar(500) NOT NULL,
	`content` text,
	`htmlContent` text,
	`orderIndex` int DEFAULT 0,
	`sponsorId` int,
	`aiGenerated` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `issueSections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `issues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`slug` varchar(500) NOT NULL,
	`previewText` varchar(150),
	`status` enum('draft','scheduled','sending','sent','archived') DEFAULT 'draft',
	`issueNumber` int NOT NULL,
	`issueDate` timestamp,
	`scheduledAt` timestamp,
	`sentAt` timestamp,
	`htmlContent` text,
	`webContent` text,
	`coverImageUrl` varchar(500),
	`readingTimeMinutes` int DEFAULT 5,
	`tags` json DEFAULT ('[]'),
	`totalRecipients` int DEFAULT 0,
	`aiGenerated` boolean DEFAULT false,
	`isPremium` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `issues_id` PRIMARY KEY(`id`),
	CONSTRAINT `issues_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `issues_issueNumber_unique` UNIQUE(`issueNumber`)
);
--> statement-breakpoint
CREATE TABLE `referralRewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subscriberId` int NOT NULL,
	`rewardType` enum('prompt_pack','premium_month','merch','custom') NOT NULL,
	`rewardName` varchar(255) NOT NULL,
	`milestoneCount` int NOT NULL,
	`isClaimed` boolean DEFAULT false,
	`claimedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referralRewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sponsors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`contactName` varchar(255),
	`contactEmail` varchar(320) NOT NULL,
	`websiteUrl` varchar(500),
	`logoUrl` varchar(500),
	`status` enum('prospect','active','paused','inactive') DEFAULT 'prospect',
	`industry` varchar(100),
	`totalSpendPkr` decimal(12,2) DEFAULT '0',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sponsors_id` PRIMARY KEY(`id`),
	CONSTRAINT `sponsors_contactEmail_unique` UNIQUE(`contactEmail`)
);
--> statement-breakpoint
CREATE TABLE `sponsorships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sponsorId` int NOT NULL,
	`issueId` int NOT NULL,
	`sectionId` int,
	`slotType` enum('primary','secondary','text_only') DEFAULT 'primary',
	`adHeadline` varchar(255),
	`adBody` text,
	`adCtaText` varchar(100),
	`adCtaUrl` varchar(500),
	`adImageUrl` varchar(500),
	`pricePkr` decimal(12,2) NOT NULL,
	`status` enum('booked','confirmed','delivered','cancelled') DEFAULT 'booked',
	`impressions` int DEFAULT 0,
	`clicks` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sponsorships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`fullName` varchar(255),
	`status` enum('pending','active','unsubscribed','bounced','complained') DEFAULT 'pending',
	`source` enum('website','referral','import','api','social') DEFAULT 'website',
	`referralCode` varchar(8) NOT NULL,
	`referredById` int,
	`referralCount` int DEFAULT 0,
	`subscriptionTier` enum('free','premium') DEFAULT 'free',
	`confirmationToken` varchar(255),
	`confirmedAt` timestamp,
	`unsubscribedAt` timestamp,
	`locationCity` varchar(100),
	`locationCountry` varchar(100) DEFAULT 'Pakistan',
	`tags` json DEFAULT ('[]'),
	`customFields` json DEFAULT ('{}'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscribers_email_unique` UNIQUE(`email`),
	CONSTRAINT `subscribers_referralCode_unique` UNIQUE(`referralCode`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `admin_idx` ON `aiGenerations` (`adminId`);--> statement-breakpoint
CREATE INDEX `toolType_idx` ON `aiGenerations` (`toolType`);--> statement-breakpoint
CREATE INDEX `subscriber_idx` ON `emailEvents` (`subscriberId`);--> statement-breakpoint
CREATE INDEX `issue_idx` ON `emailEvents` (`issueId`);--> statement-breakpoint
CREATE INDEX `eventType_idx` ON `emailEvents` (`eventType`);--> statement-breakpoint
CREATE INDEX `issue_idx` ON `issueSections` (`issueId`);--> statement-breakpoint
CREATE INDEX `admin_idx` ON `issues` (`adminId`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `issues` (`slug`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `subscribers` (`email`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `subscribers` (`status`);