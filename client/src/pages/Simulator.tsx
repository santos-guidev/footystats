import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, TrendingUp, Loader2 } from "lucide-react";
import { Link } from "wouter";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Simulator() {
  const [homeTeamId, setHomeTeamId] = useState<number | null>(null);
  const [awayTeamId, setAwayTeamId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [simulations, setSimulations] = useState(10000);

  const { data: teams } = trpc.teams.list.useQuery();
  const { data: homeTeam } = trpc.teams.getById.useQuery({ id: homeTeamId! }, { enabled: !!homeTeamId });
  const { data: awayTeam } = trpc.teams.getById.useQuery({ id: awayTeamId! }, { enabled: !!awayTeamId });
  
  const { 
    data: prediction, 
    isLoading: predicting,
    refetch: simulate 
  } = trpc.simulator.predict.useQuery(
    { 
      homeTeamId: homeTeamId!, 
      awayTeamId: awayTeamId!,
      simulations 
    }, 
    { enabled: false }
  );

  const filteredTeams = teams?.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canSimulate = homeTeamId && awayTeamId && homeTeamId !== awayTeamId;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 via-background to-background border-b border-border">
        <div className="container py-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>

          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
              <TrendingUp className="h-10 w-10 text-primary" />
              Simulador de Mercados
            </h1>
            <p className="text-lg text-muted-foreground">
              Use o modelo de distribuição de Poisson para prever resultados e probabilidades de mercados de apostas
            </p>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Team Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Selecione os Times</CardTitle>
            <CardDescription>
              Escolha o time da casa e o time visitante para simular a partida
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
              {/* Home Team */}
              <div>
                <label className="text-sm font-medium mb-2 block">Time da Casa</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start h-auto py-4">
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          <span className="font-semibold">
                            {homeTeam ? homeTeam.name : "Selecione o time da casa"}
                          </span>
                        </div>
                        {homeTeam?.stadium && (
                          <span className="text-xs text-muted-foreground">{homeTeam.stadium}</span>
                        )}
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Buscar time..." 
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>Nenhum time encontrado.</CommandEmpty>
                        <CommandGroup>
                          {filteredTeams?.map((team) => (
                            <CommandItem
                              key={team.id}
                              onSelect={() => {
                                setHomeTeamId(team.id);
                                setSearchQuery("");
                              }}
                              disabled={team.id === awayTeamId}
                            >
                              <div className="flex flex-col">
                                <span>{team.name}</span>
                                {team.country && (
                                  <span className="text-xs text-muted-foreground">{team.country}</span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* VS */}
              <div className="text-center">
                <span className="text-3xl font-bold text-muted-foreground">VS</span>
              </div>

              {/* Away Team */}
              <div>
                <label className="text-sm font-medium mb-2 block">Time Visitante</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start h-auto py-4">
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          <span className="font-semibold">
                            {awayTeam ? awayTeam.name : "Selecione o time visitante"}
                          </span>
                        </div>
                        {awayTeam?.stadium && (
                          <span className="text-xs text-muted-foreground">{awayTeam.stadium}</span>
                        )}
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Buscar time..." 
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>Nenhum time encontrado.</CommandEmpty>
                        <CommandGroup>
                          {filteredTeams?.map((team) => (
                            <CommandItem
                              key={team.id}
                              onSelect={() => {
                                setAwayTeamId(team.id);
                                setSearchQuery("");
                              }}
                              disabled={team.id === homeTeamId}
                            >
                              <div className="flex flex-col">
                                <span>{team.name}</span>
                                {team.country && (
                                  <span className="text-xs text-muted-foreground">{team.country}</span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button 
                size="lg" 
                onClick={() => simulate()}
                disabled={!canSimulate || predicting}
                className="gap-2"
              >
                {predicting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Simulando...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-5 w-5" />
                    Simular Partida
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {prediction && homeTeam && awayTeam && (
          <div className="space-y-6">
            {/* Main Probabilities */}
            <Card>
              <CardHeader>
                <CardTitle>Probabilidades de Resultado</CardTitle>
                <CardDescription>
                  Baseado em {simulations.toLocaleString('pt-BR')} simulações Monte Carlo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ProbabilityCard
                    label={`Vitória ${homeTeam.name}`}
                    probability={prediction.probabilities.homeWin}
                    color="chart-1"
                  />
                  <ProbabilityCard
                    label="Empate"
                    probability={prediction.probabilities.draw}
                    color="chart-3"
                  />
                  <ProbabilityCard
                    label={`Vitória ${awayTeam.name}`}
                    probability={prediction.probabilities.awayWin}
                    color="chart-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Expected Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Gols Esperados (xG)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">{homeTeam.name}</p>
                    <p className="text-5xl font-bold text-primary">
                      {prediction.expectedGoals.home.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">gols esperados</p>
                  </div>
                  <div className="text-center p-6 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">{awayTeam.name}</p>
                    <p className="text-5xl font-bold text-primary">
                      {prediction.expectedGoals.away.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">gols esperados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Markets */}
            <Tabs defaultValue="goals" className="space-y-6">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                <TabsTrigger value="goals">Gols</TabsTrigger>
                <TabsTrigger value="btts">Ambas Marcam</TabsTrigger>
                <TabsTrigger value="scores">Placares</TabsTrigger>
              </TabsList>

              <TabsContent value="goals" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Over/Under 2.5 Gols</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <MarketOption
                          label="Over 2.5"
                          probability={prediction.markets.over25}
                        />
                        <MarketOption
                          label="Under 2.5"
                          probability={prediction.markets.under25}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Over/Under 3.5 Gols</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <MarketOption
                          label="Over 3.5"
                          probability={prediction.markets.over35}
                        />
                        <MarketOption
                          label="Under 3.5"
                          probability={prediction.markets.under35}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="btts">
                <Card>
                  <CardHeader>
                    <CardTitle>Ambas as Equipes Marcam</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <MarketOption
                        label="Sim - Ambas Marcam"
                        probability={prediction.markets.bothTeamsScore}
                      />
                      <MarketOption
                        label="Não - Pelo Menos Uma Não Marca"
                        probability={100 - prediction.markets.bothTeamsScore}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="scores">
                <Card>
                  <CardHeader>
                    <CardTitle>Placares Mais Prováveis</CardTitle>
                    <CardDescription>
                      Top 5 resultados mais prováveis baseados na simulação
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {prediction.mostLikelyScores.map((score, index) => (
                        <div 
                          key={score.score}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className="text-lg font-bold">
                              #{index + 1}
                            </Badge>
                            <span className="text-2xl font-bold">{score.score}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              {score.probability.toFixed(1)}%
                            </p>
                            <p className="text-xs text-muted-foreground">probabilidade</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Disclaimer */}
            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Aviso:</strong> As probabilidades apresentadas são baseadas em simulações estatísticas usando o modelo de distribuição de Poisson e dados históricos. 
                  Estes resultados são apenas para fins informativos e de análise. Não devem ser usados como única base para decisões de apostas.
                  Fatores como forma recente, lesões, condições climáticas e outros aspectos não são considerados neste modelo simplificado.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {!prediction && (
          <Card>
            <CardContent className="p-12 text-center">
              <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Pronto para Simular?</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Selecione dois times acima e clique em "Simular Partida" para ver as probabilidades de resultados e mercados
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ProbabilityCard({ 
  label, 
  probability, 
  color 
}: { 
  label: string; 
  probability: number; 
  color: string;
}) {
  return (
    <div className="text-center p-6 bg-card border border-border rounded-lg">
      <p className="text-sm text-muted-foreground mb-3">{label}</p>
      <p className={`text-5xl font-bold mb-4`} style={{ color: `hsl(var(--${color}))` }}>
        {probability.toFixed(1)}%
      </p>
      <Progress value={probability} className="h-2" />
    </div>
  );
}

function MarketOption({ 
  label, 
  probability 
}: { 
  label: string; 
  probability: number;
}) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="font-medium">{label}</span>
        <span className="text-lg font-bold text-primary">{probability.toFixed(1)}%</span>
      </div>
      <Progress value={probability} className="h-3" />
    </div>
  );
}
