import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Ligas/Competições
 */
export const leagues = mysqlTable("leagues", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }),
  season: varchar("season", { length: 20 }),
  logo: text("logo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type League = typeof leagues.$inferSelect;
export type InsertLeague = typeof leagues.$inferInsert;

/**
 * Times
 */
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  shortName: varchar("shortName", { length: 100 }),
  logo: text("logo"),
  country: varchar("country", { length: 100 }),
  founded: int("founded"),
  stadium: varchar("stadium", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

/**
 * Partidas
 */
export const matches = mysqlTable("matches", {
  id: int("id").autoincrement().primaryKey(),
  leagueId: int("leagueId").references(() => leagues.id),
  homeTeamId: int("homeTeamId").notNull().references(() => teams.id),
  awayTeamId: int("awayTeamId").notNull().references(() => teams.id),
  matchDate: timestamp("matchDate").notNull(),
  status: mysqlEnum("status", ["scheduled", "live", "finished", "postponed", "cancelled"]).default("scheduled").notNull(),
  homeScore: int("homeScore"),
  awayScore: int("awayScore"),
  homeScoreHT: int("homeScoreHT"),
  awayScoreHT: int("awayScoreHT"),
  round: varchar("round", { length: 50 }),
  venue: varchar("venue", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;

/**
 * Estatísticas detalhadas de partidas
 */
export const matchStats = mysqlTable("matchStats", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").notNull().references(() => matches.id),
  teamId: int("teamId").notNull().references(() => teams.id),
  isHome: boolean("isHome").notNull(),
  
  // Estatísticas de ataque
  shotsTotal: int("shotsTotal"),
  shotsOnTarget: int("shotsOnTarget"),
  shotsOffTarget: int("shotsOffTarget"),
  shotsBlocked: int("shotsBlocked"),
  shotsInsideBox: int("shotsInsideBox"),
  shotsOutsideBox: int("shotsOutsideBox"),
  
  // Posse e passes
  possession: int("possession"),
  passesTotal: int("passesTotal"),
  passesAccurate: int("passesAccurate"),
  passesAccuracyPercent: int("passesAccuracyPercent"),
  
  // Defesa
  tackles: int("tackles"),
  blocks: int("blocks"),
  interceptions: int("interceptions"),
  clearances: int("clearances"),
  
  // Disciplina
  foulsCommitted: int("foulsCommitted"),
  foulsDrawn: int("foulsDrawn"),
  yellowCards: int("yellowCards"),
  redCards: int("redCards"),
  
  // Outros
  corners: int("corners"),
  offsides: int("offsides"),
  saves: int("saves"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MatchStat = typeof matchStats.$inferSelect;
export type InsertMatchStat = typeof matchStats.$inferInsert;

/**
 * Estatísticas agregadas de times (para comparação e análise)
 */
export const teamStats = mysqlTable("teamStats", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull().references(() => teams.id),
  leagueId: int("leagueId").references(() => leagues.id),
  season: varchar("season", { length: 20 }),
  
  // Estatísticas gerais
  matchesPlayed: int("matchesPlayed").default(0),
  wins: int("wins").default(0),
  draws: int("draws").default(0),
  losses: int("losses").default(0),
  goalsFor: int("goalsFor").default(0),
  goalsAgainst: int("goalsAgainst").default(0),
  
  // Estatísticas em casa
  homeMatchesPlayed: int("homeMatchesPlayed").default(0),
  homeWins: int("homeWins").default(0),
  homeDraws: int("homeDraws").default(0),
  homeLosses: int("homeLosses").default(0),
  homeGoalsFor: int("homeGoalsFor").default(0),
  homeGoalsAgainst: int("homeGoalsAgainst").default(0),
  
  // Estatísticas fora
  awayMatchesPlayed: int("awayMatchesPlayed").default(0),
  awayWins: int("awayWins").default(0),
  awayDraws: int("awayDraws").default(0),
  awayLosses: int("awayLosses").default(0),
  awayGoalsFor: int("awayGoalsFor").default(0),
  awayGoalsAgainst: int("awayGoalsAgainst").default(0),
  
  // Médias
  avgGoalsFor: int("avgGoalsFor").default(0),
  avgGoalsAgainst: int("avgGoalsAgainst").default(0),
  avgPossession: int("avgPossession").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeamStat = typeof teamStats.$inferSelect;
export type InsertTeamStat = typeof teamStats.$inferInsert;

/**
 * Logs de sincronização de dados
 */
export const syncLogs = mysqlTable("syncLogs", {
  id: int("id").autoincrement().primaryKey(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  tableName: varchar("tableName", { length: 100 }),
  status: mysqlEnum("status", ["success", "error", "in_progress"]).default("in_progress").notNull(),
  rowsProcessed: int("rowsProcessed").default(0),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type SyncLog = typeof syncLogs.$inferSelect;
export type InsertSyncLog = typeof syncLogs.$inferInsert;
