import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export default function MatchDetail() {
  const params = useParams();
  const matchId = params.id ? parseInt(params.id) : 0;
  
  const { data: matchData, isLoading: loadingMatch } = trpc.matches.getById.useQuery({ id: matchId });
  const { data: matchStats, isLoading: loadingStats } = trpc.matches.getStats.useQuery({ matchId });

  if (loadingMatch) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!matchData || !matchData.match) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Partida não encontrada</p>
              <Link href="/">
                <Button className="mt-4">Voltar ao início</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { match, homeTeam, awayTeam, league } = matchData;

  const homeStats = matchStats?.find(s => s.stats?.isHome === true);
  const awayStats = matchStats?.find(s => s.stats?.isHome === false);

  // Preparar dados para gráficos
  const comparisonData = [
    {
      stat: 'Chutes',
      [homeTeam?.name || 'Casa']: homeStats?.stats?.shotsTotal || 0,
      [awayTeam?.name || 'Fora']: awayStats?.stats?.shotsTotal || 0,
    },
    {
      stat: 'No Alvo',
      [homeTeam?.name || 'Casa']: homeStats?.stats?.shotsOnTarget || 0,
      [awayTeam?.name || 'Fora']: awayStats?.stats?.shotsOnTarget || 0,
    },
    {
      stat: 'Escanteios',
      [homeTeam?.name || 'Casa']: homeStats?.stats?.corners || 0,
      [awayTeam?.name || 'Fora']: awayStats?.stats?.corners || 0,
    },
    {
      stat: 'Faltas',
      [homeTeam?.name || 'Casa']: homeStats?.stats?.foulsCommitted || 0,
      [awayTeam?.name || 'Fora']: awayStats?.stats?.foulsCommitted || 0,
    },
  ];

  const radarData = [
    {
      stat: 'Ataque',
      [homeTeam?.name || 'Casa']: homeStats?.stats?.shotsTotal || 0,
      [awayTeam?.name || 'Fora']: awayStats?.stats?.shotsTotal || 0,
    },
    {
      stat: 'Defesa',
      [homeTeam?.name || 'Casa']: homeStats?.stats?.tackles || 0,
      [awayTeam?.name || 'Fora']: awayStats?.stats?.tackles || 0,
    },
    {
      stat: 'Passes',
      [homeTeam?.name || 'Casa']: (homeStats?.stats?.passesAccurate || 0) / 10,
      [awayTeam?.name || 'Fora']: (awayStats?.stats?.passesAccurate || 0) / 10,
    },
    {
      stat: 'Posse',
      [homeTeam?.name || 'Casa']: homeStats?.stats?.possession || 0,
      [awayTeam?.name || 'Fora']: awayStats?.stats?.possession || 0,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container py-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <Badge variant="outline">{league?.name || 'Liga'}</Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(match.matchDate).toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            {match.venue && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {match.venue}
              </div>
            )}
          </div>

          {/* Score Display */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-8 items-center max-w-4xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">{homeTeam?.name}</h2>
              <p className="text-sm text-muted-foreground">{homeTeam?.stadium}</p>
            </div>

            <div className="flex flex-col items-center gap-4">
              {match.status === 'finished' || match.status === 'live' ? (
                <>
                  <div className="flex items-center gap-6">
                    <span className="text-6xl font-bold">{match.homeScore ?? 0}</span>
                    <span className="text-4xl text-muted-foreground">-</span>
                    <span className="text-6xl font-bold">{match.awayScore ?? 0}</span>
                  </div>
                  {match.homeScoreHT !== null && match.awayScoreHT !== null && (
                    <p className="text-sm text-muted-foreground">
                      HT: {match.homeScoreHT} - {match.awayScoreHT}
                    </p>
                  )}
                </>
              ) : (
                <span className="text-3xl text-muted-foreground">vs</span>
              )}
              <Badge 
                variant={
                  match.status === 'finished' ? 'secondary' : 
                  match.status === 'live' ? 'default' : 
                  'outline'
                }
                className="text-sm"
              >
                {match.status === 'finished' ? 'Finalizado' : 
                 match.status === 'live' ? 'Ao Vivo' : 
                 'Agendado'}
              </Badge>
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">{awayTeam?.name}</h2>
              <p className="text-sm text-muted-foreground">{awayTeam?.stadium}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Content */}
      <div className="container py-8">
        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            <TabsTrigger value="charts">Gráficos</TabsTrigger>
            <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            {loadingStats ? (
              <Skeleton className="h-96 w-full" />
            ) : homeStats && awayStats ? (
              <>
                {/* Possession */}
                <Card>
                  <CardHeader>
                    <CardTitle>Posse de Bola</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold">{homeTeam?.name}</span>
                        <span className="font-semibold">{awayTeam?.name}</span>
                      </div>
                      <div className="relative">
                        <Progress 
                          value={homeStats.stats?.possession || 0} 
                          className="h-8"
                        />
                        <div className="absolute inset-0 flex items-center justify-between px-4 text-sm font-semibold">
                          <span>{homeStats.stats?.possession || 0}%</span>
                          <span>{awayStats.stats?.possession || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shots */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StatComparison
                    title="Chutes Totais"
                    homeValue={homeStats.stats?.shotsTotal || 0}
                    awayValue={awayStats.stats?.shotsTotal || 0}
                    homeTeam={homeTeam?.name || 'Casa'}
                    awayTeam={awayTeam?.name || 'Fora'}
                  />
                  <StatComparison
                    title="Chutes no Alvo"
                    homeValue={homeStats.stats?.shotsOnTarget || 0}
                    awayValue={awayStats.stats?.shotsOnTarget || 0}
                    homeTeam={homeTeam?.name || 'Casa'}
                    awayTeam={awayTeam?.name || 'Fora'}
                  />
                  <StatComparison
                    title="Escanteios"
                    homeValue={homeStats.stats?.corners || 0}
                    awayValue={awayStats.stats?.corners || 0}
                    homeTeam={homeTeam?.name || 'Casa'}
                    awayTeam={awayTeam?.name || 'Fora'}
                  />
                  <StatComparison
                    title="Faltas Cometidas"
                    homeValue={homeStats.stats?.foulsCommitted || 0}
                    awayValue={awayStats.stats?.foulsCommitted || 0}
                    homeTeam={homeTeam?.name || 'Casa'}
                    awayTeam={awayTeam?.name || 'Fora'}
                  />
                  <StatComparison
                    title="Cartões Amarelos"
                    homeValue={homeStats.stats?.yellowCards || 0}
                    awayValue={awayStats.stats?.yellowCards || 0}
                    homeTeam={homeTeam?.name || 'Casa'}
                    awayTeam={awayTeam?.name || 'Fora'}
                  />
                  <StatComparison
                    title="Cartões Vermelhos"
                    homeValue={homeStats.stats?.redCards || 0}
                    awayValue={awayStats.stats?.redCards || 0}
                    homeTeam={homeTeam?.name || 'Casa'}
                    awayTeam={awayTeam?.name || 'Fora'}
                  />
                </div>

                {/* Passing */}
                <Card>
                  <CardHeader>
                    <CardTitle>Estatísticas de Passe</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">{homeTeam?.name}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total de Passes</span>
                            <span className="font-semibold">{homeStats.stats?.passesTotal || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Passes Certos</span>
                            <span className="font-semibold">{homeStats.stats?.passesAccurate || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Precisão</span>
                            <span className="font-semibold">{homeStats.stats?.passesAccuracyPercent || 0}%</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">{awayTeam?.name}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total de Passes</span>
                            <span className="font-semibold">{awayStats.stats?.passesTotal || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Passes Certos</span>
                            <span className="font-semibold">{awayStats.stats?.passesAccurate || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Precisão</span>
                            <span className="font-semibold">{awayStats.stats?.passesAccuracyPercent || 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Estatísticas não disponíveis para esta partida</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            {homeStats && awayStats ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Comparação de Estatísticas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="stat" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey={homeTeam?.name || 'Casa'} fill="hsl(var(--chart-1))" />
                        <Bar dataKey={awayTeam?.name || 'Fora'} fill="hsl(var(--chart-2))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Análise Radar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="stat" />
                        <PolarRadiusAxis />
                        <Radar name={homeTeam?.name || 'Casa'} dataKey={homeTeam?.name || 'Casa'} stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} />
                        <Radar name={awayTeam?.name || 'Fora'} dataKey={awayTeam?.name || 'Fora'} stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Dados insuficientes para gerar gráficos</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Linha do tempo em desenvolvimento</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatComparison({ 
  title, 
  homeValue, 
  awayValue, 
  homeTeam, 
  awayTeam 
}: { 
  title: string; 
  homeValue: number; 
  awayValue: number; 
  homeTeam: string; 
  awayTeam: string; 
}) {
  const total = homeValue + awayValue;
  const homePercent = total > 0 ? (homeValue / total) * 100 : 50;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-semibold">{homeValue}</span>
            <span className="font-semibold">{awayValue}</span>
          </div>
          <Progress value={homePercent} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
