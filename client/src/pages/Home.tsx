import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, TrendingUp, Users, Trophy, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { data: leagues, isLoading: loadingLeagues } = trpc.leagues.list.useQuery();
  const { data: recentMatches, isLoading: loadingMatches } = trpc.matches.recent.useQuery({ limit: 10 });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/20 via-background to-background border-b border-border">
        <div className="container py-16">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-4 text-foreground">
              FootyStats
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Análise avançada de futebol com estatísticas detalhadas, comparação de times e simulação de mercados usando modelo Poisson
            </p>
            <div className="flex gap-4">
              <Link href="/simulator">
                <Button size="lg" className="gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Simulador de Mercados
                </Button>
              </Link>
              <Link href="/compare">
                <Button size="lg" variant="outline" className="gap-2">
                  <Users className="h-5 w-5" />
                  Comparar Times
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Matches */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  Partidas Recentes
                </h2>
                <Link href="/matches">
                  <Button variant="ghost" size="sm" className="gap-2">
                    Ver todas
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {loadingMatches ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))
                ) : recentMatches && recentMatches.length > 0 ? (
                  recentMatches.map((item) => {
                    const match = item.match;
                    const homeTeam = item.homeTeam;
                    const awayTeam = item.awayTeam;
                    const league = item.league;

                    if (!match || !homeTeam || !awayTeam) return null;

                    return (
                      <Link key={match.id} href={`/match/${match.id}`}>
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                  <Badge variant="outline" className="text-xs">
                                    {league?.name || 'Liga'}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(match.matchDate).toLocaleDateString('pt-BR')}
                                  </span>
                                  <Badge 
                                    variant={
                                      match.status === 'finished' ? 'secondary' : 
                                      match.status === 'live' ? 'default' : 
                                      'outline'
                                    }
                                  >
                                    {match.status === 'finished' ? 'Finalizado' : 
                                     match.status === 'live' ? 'Ao Vivo' : 
                                     'Agendado'}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                                  <div className="text-right">
                                    <p className="font-semibold text-lg">{homeTeam.name}</p>
                                  </div>
                                  
                                  <div className="flex items-center gap-3 px-6">
                                    {match.status === 'finished' || match.status === 'live' ? (
                                      <>
                                        <span className="text-3xl font-bold">{match.homeScore ?? 0}</span>
                                        <span className="text-2xl text-muted-foreground">-</span>
                                        <span className="text-3xl font-bold">{match.awayScore ?? 0}</span>
                                      </>
                                    ) : (
                                      <span className="text-xl text-muted-foreground">vs</span>
                                    )}
                                  </div>
                                  
                                  <div className="text-left">
                                    <p className="font-semibold text-lg">{awayTeam.name}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhuma partida encontrada</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Leagues */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                Ligas
              </h2>
              
              <div className="space-y-3">
                {loadingLeagues ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))
                ) : leagues && leagues.length > 0 ? (
                  leagues.slice(0, 10).map((league) => (
                    <Link key={league.id} href={`/league/${league.id}`}>
                      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{league.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {league.country} {league.season && `• ${league.season}`}
                              </p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Trophy className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Nenhuma liga encontrada</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>

            {/* Quick Stats */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Estatísticas Rápidas</h2>
              
              <div className="space-y-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total de Ligas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{leagues?.length || 0}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Partidas Registradas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{recentMatches?.length || 0}</p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
