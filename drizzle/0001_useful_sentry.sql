CREATE TABLE `leagues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`country` varchar(100),
	`season` varchar(20),
	`logo` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leagues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `matchStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matchId` int NOT NULL,
	`teamId` int NOT NULL,
	`isHome` boolean NOT NULL,
	`shotsTotal` int,
	`shotsOnTarget` int,
	`shotsOffTarget` int,
	`shotsBlocked` int,
	`shotsInsideBox` int,
	`shotsOutsideBox` int,
	`possession` int,
	`passesTotal` int,
	`passesAccurate` int,
	`passesAccuracyPercent` int,
	`tackles` int,
	`blocks` int,
	`interceptions` int,
	`clearances` int,
	`foulsCommitted` int,
	`foulsDrawn` int,
	`yellowCards` int,
	`redCards` int,
	`corners` int,
	`offsides` int,
	`saves` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `matchStats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leagueId` int,
	`homeTeamId` int NOT NULL,
	`awayTeamId` int NOT NULL,
	`matchDate` timestamp NOT NULL,
	`status` enum('scheduled','live','finished','postponed','cancelled') NOT NULL DEFAULT 'scheduled',
	`homeScore` int,
	`awayScore` int,
	`homeScoreHT` int,
	`awayScoreHT` int,
	`round` varchar(50),
	`venue` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `matches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `syncLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`tableName` varchar(100),
	`status` enum('success','error','in_progress') NOT NULL DEFAULT 'in_progress',
	`rowsProcessed` int DEFAULT 0,
	`errorMessage` text,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `syncLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teamStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`leagueId` int,
	`season` varchar(20),
	`matchesPlayed` int DEFAULT 0,
	`wins` int DEFAULT 0,
	`draws` int DEFAULT 0,
	`losses` int DEFAULT 0,
	`goalsFor` int DEFAULT 0,
	`goalsAgainst` int DEFAULT 0,
	`homeMatchesPlayed` int DEFAULT 0,
	`homeWins` int DEFAULT 0,
	`homeDraws` int DEFAULT 0,
	`homeLosses` int DEFAULT 0,
	`homeGoalsFor` int DEFAULT 0,
	`homeGoalsAgainst` int DEFAULT 0,
	`awayMatchesPlayed` int DEFAULT 0,
	`awayWins` int DEFAULT 0,
	`awayDraws` int DEFAULT 0,
	`awayLosses` int DEFAULT 0,
	`awayGoalsFor` int DEFAULT 0,
	`awayGoalsAgainst` int DEFAULT 0,
	`avgGoalsFor` int DEFAULT 0,
	`avgGoalsAgainst` int DEFAULT 0,
	`avgPossession` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teamStats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`shortName` varchar(100),
	`logo` text,
	`country` varchar(100),
	`founded` int,
	`stadium` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `matchStats` ADD CONSTRAINT `matchStats_matchId_matches_id_fk` FOREIGN KEY (`matchId`) REFERENCES `matches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `matchStats` ADD CONSTRAINT `matchStats_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `matches` ADD CONSTRAINT `matches_leagueId_leagues_id_fk` FOREIGN KEY (`leagueId`) REFERENCES `leagues`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `matches` ADD CONSTRAINT `matches_homeTeamId_teams_id_fk` FOREIGN KEY (`homeTeamId`) REFERENCES `teams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `matches` ADD CONSTRAINT `matches_awayTeamId_teams_id_fk` FOREIGN KEY (`awayTeamId`) REFERENCES `teams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teamStats` ADD CONSTRAINT `teamStats_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teamStats` ADD CONSTRAINT `teamStats_leagueId_leagues_id_fk` FOREIGN KEY (`leagueId`) REFERENCES `leagues`(`id`) ON DELETE no action ON UPDATE no action;