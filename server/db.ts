import { eq, desc, and, sql, or, like, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  leagues, 
  teams, 
  matches, 
  matchStats, 
  teamStats, 
  syncLogs,
  InsertLeague,
  InsertTeam,
  InsertMatch,
  InsertMatchStat,
  InsertTeamStat,
  InsertSyncLog
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ========== USER FUNCTIONS ==========

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ========== LEAGUE FUNCTIONS ==========

export async function getAllLeagues() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(leagues).orderBy(desc(leagues.createdAt));
}

export async function getLeagueById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(leagues).where(eq(leagues.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertLeague(league: InsertLeague) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(leagues).values(league).onDuplicateKeyUpdate({
    set: {
      name: league.name,
      country: league.country,
      season: league.season,
      logo: league.logo,
    }
  });
}

// ========== TEAM FUNCTIONS ==========

export async function getAllTeams() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(teams).orderBy(teams.name);
}

export async function getTeamById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(teams).where(eq(teams.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function searchTeams(query: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(teams)
    .where(like(teams.name, `%${query}%`))
    .orderBy(teams.name)
    .limit(20);
}

export async function upsertTeam(team: InsertTeam) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(teams).values(team).onDuplicateKeyUpdate({
    set: {
      name: team.name,
      shortName: team.shortName,
      logo: team.logo,
      country: team.country,
      founded: team.founded,
      stadium: team.stadium,
    }
  });
  
  return result;
}

// ========== MATCH FUNCTIONS ==========

export async function getRecentMatches(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    match: matches,
    homeTeam: teams,
    awayTeam: teams,
    league: leagues,
  })
  .from(matches)
  .leftJoin(teams, eq(matches.homeTeamId, teams.id))
  .leftJoin(teams, eq(matches.awayTeamId, teams.id))
  .leftJoin(leagues, eq(matches.leagueId, leagues.id))
  .orderBy(desc(matches.matchDate))
  .limit(limit);
}

export async function getMatchById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select({
    match: matches,
    homeTeam: teams,
    awayTeam: teams,
    league: leagues,
  })
  .from(matches)
  .leftJoin(teams, eq(matches.homeTeamId, teams.id))
  .leftJoin(teams, eq(matches.awayTeamId, teams.id))
  .leftJoin(leagues, eq(matches.leagueId, leagues.id))
  .where(eq(matches.id, id))
  .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getMatchesByLeague(leagueId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    match: matches,
    homeTeam: teams,
    awayTeam: teams,
  })
  .from(matches)
  .leftJoin(teams, eq(matches.homeTeamId, teams.id))
  .leftJoin(teams, eq(matches.awayTeamId, teams.id))
  .where(eq(matches.leagueId, leagueId))
  .orderBy(desc(matches.matchDate))
  .limit(limit);
}

export async function getMatchesByTeam(teamId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    match: matches,
    homeTeam: teams,
    awayTeam: teams,
    league: leagues,
  })
  .from(matches)
  .leftJoin(teams, eq(matches.homeTeamId, teams.id))
  .leftJoin(teams, eq(matches.awayTeamId, teams.id))
  .leftJoin(leagues, eq(matches.leagueId, leagues.id))
  .where(
    or(
      eq(matches.homeTeamId, teamId),
      eq(matches.awayTeamId, teamId)
    )
  )
  .orderBy(desc(matches.matchDate))
  .limit(limit);
}

export async function upsertMatch(match: InsertMatch) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(matches).values(match);
  return result;
}

// ========== MATCH STATS FUNCTIONS ==========

export async function getMatchStatsByMatchId(matchId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    stats: matchStats,
    team: teams,
  })
  .from(matchStats)
  .leftJoin(teams, eq(matchStats.teamId, teams.id))
  .where(eq(matchStats.matchId, matchId));
}

export async function upsertMatchStats(stats: InsertMatchStat) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(matchStats).values(stats);
}

// ========== TEAM STATS FUNCTIONS ==========

export async function getTeamStatsByTeamId(teamId: number, season?: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const conditions = season 
    ? and(eq(teamStats.teamId, teamId), eq(teamStats.season, season))
    : eq(teamStats.teamId, teamId);
  
  const result = await db.select().from(teamStats)
    .where(conditions)
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertTeamStats(stats: InsertTeamStat) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(teamStats).values(stats).onDuplicateKeyUpdate({
    set: stats
  });
}

// ========== SYNC LOG FUNCTIONS ==========

export async function getSyncLogs(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(syncLogs)
    .orderBy(desc(syncLogs.startedAt))
    .limit(limit);
}

export async function createSyncLog(log: InsertSyncLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(syncLogs).values(log);
  return result;
}

export async function updateSyncLog(id: number, updates: Partial<InsertSyncLog>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(syncLogs)
    .set(updates)
    .where(eq(syncLogs.id, id));
}
