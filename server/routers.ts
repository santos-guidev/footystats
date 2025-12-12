import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ========== LEAGUES ==========
  leagues: router({
    list: publicProcedure.query(async () => {
      return await db.getAllLeagues();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getLeagueById(input.id);
      }),
  }),

  // ========== TEAMS ==========
  teams: router({
    list: publicProcedure.query(async () => {
      return await db.getAllTeams();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getTeamById(input.id);
      }),
    
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await db.searchTeams(input.query);
      }),
    
    getStats: publicProcedure
      .input(z.object({ 
        teamId: z.number(),
        season: z.string().optional()
      }))
      .query(async ({ input }) => {
        return await db.getTeamStatsByTeamId(input.teamId, input.season);
      }),
  }),

  // ========== MATCHES ==========
  matches: router({
    recent: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getRecentMatches(input?.limit);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getMatchById(input.id);
      }),
    
    byLeague: publicProcedure
      .input(z.object({ 
        leagueId: z.number(),
        limit: z.number().optional()
      }))
      .query(async ({ input }) => {
        return await db.getMatchesByLeague(input.leagueId, input.limit);
      }),
    
    byTeam: publicProcedure
      .input(z.object({ 
        teamId: z.number(),
        limit: z.number().optional()
      }))
      .query(async ({ input }) => {
        return await db.getMatchesByTeam(input.teamId, input.limit);
      }),
    
    getStats: publicProcedure
      .input(z.object({ matchId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMatchStatsByMatchId(input.matchId);
      }),
  }),

  // ========== DATA SYNC (Admin only) ==========
  sync: router({
    logs: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getSyncLogs(input?.limit);
      }),
    
    // Endpoint para receber dados do backend Python
    importData: protectedProcedure
      .input(z.object({
        type: z.enum(['leagues', 'teams', 'matches', 'stats']),
        data: z.array(z.any()),
        fileName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const logEntry = await db.createSyncLog({
          fileName: input.fileName || `${input.type}_import`,
          tableName: input.type,
          status: 'in_progress',
          rowsProcessed: 0,
          startedAt: new Date(),
        });
        
        const logId = Number((logEntry as any).insertId || 0);
        
        try {
          let processed = 0;
          
          // Processar dados baseado no tipo
          for (const item of input.data) {
            switch (input.type) {
              case 'leagues':
                await db.upsertLeague(item);
                break;
              case 'teams':
                await db.upsertTeam(item);
                break;
              case 'matches':
                await db.upsertMatch(item);
                break;
              case 'stats':
                await db.upsertMatchStats(item);
                break;
            }
            processed++;
          }
          
          // Atualizar log com sucesso
          if (logId > 0) {
            await db.updateSyncLog(logId, {
              status: 'success',
              rowsProcessed: processed,
              completedAt: new Date(),
            });
          }
          
          return { success: true, processed };
        } catch (error) {
          // Atualizar log com erro
          if (logId > 0) {
            await db.updateSyncLog(logId, {
              status: 'error',
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
              completedAt: new Date(),
            });
          }
          
          throw error;
        }
      }),
  }),

  // ========== SIMULATOR ==========
  simulator: router({
    // Calcular probabilidades usando distribuição de Poisson
    predict: publicProcedure
      .input(z.object({
        homeTeamId: z.number(),
        awayTeamId: z.number(),
        simulations: z.number().default(10000),
      }))
      .query(async ({ input }) => {
        // Buscar estatísticas dos times
        const homeStats = await db.getTeamStatsByTeamId(input.homeTeamId);
        const awayStats = await db.getTeamStatsByTeamId(input.awayTeamId);
        
        if (!homeStats || !awayStats) {
          throw new Error('Team statistics not found');
        }
        
        // Calcular lambdas (média de gols)
        const homeLambda = (homeStats.homeGoalsFor ?? 0) / Math.max(homeStats.homeMatchesPlayed ?? 1, 1);
        const awayLambda = (awayStats.awayGoalsFor ?? 0) / Math.max(awayStats.awayMatchesPlayed ?? 1, 1);
        
        // Simulação Monte Carlo
        let homeWins = 0;
        let draws = 0;
        let awayWins = 0;
        let over25 = 0;
        let over35 = 0;
        let bothScore = 0;
        
        const goalDistribution: Record<string, number> = {};
        
        for (let i = 0; i < input.simulations; i++) {
          // Gerar gols usando distribuição de Poisson
          const homeGoals = poissonRandom(homeLambda);
          const awayGoals = poissonRandom(awayLambda);
          const total = homeGoals + awayGoals;
          
          // Contabilizar resultados
          if (homeGoals > awayGoals) homeWins++;
          else if (homeGoals === awayGoals) draws++;
          else awayWins++;
          
          if (total > 2.5) over25++;
          if (total > 3.5) over35++;
          if (homeGoals > 0 && awayGoals > 0) bothScore++;
          
          // Distribuição de placares
          const score = `${homeGoals}-${awayGoals}`;
          goalDistribution[score] = (goalDistribution[score] || 0) + 1;
        }
        
        // Calcular probabilidades
        const total = input.simulations;
        
        return {
          probabilities: {
            homeWin: (homeWins / total) * 100,
            draw: (draws / total) * 100,
            awayWin: (awayWins / total) * 100,
          },
          markets: {
            over25: (over25 / total) * 100,
            under25: ((total - over25) / total) * 100,
            over35: (over35 / total) * 100,
            under35: ((total - over35) / total) * 100,
            bothTeamsScore: (bothScore / total) * 100,
          },
          expectedGoals: {
            home: homeLambda,
            away: awayLambda,
          },
          mostLikelyScores: Object.entries(goalDistribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([score, count]) => ({
              score,
              probability: (count / total) * 100,
            })),
        };
      }),
  }),
});

// Função auxiliar para gerar números aleatórios com distribuição de Poisson
function poissonRandom(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  
  return k - 1;
}

export type AppRouter = typeof appRouter;
