import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, TrendingUp, TrendingDown, Minus } from "lucide-react";
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export default function CompareTeams() {
  const [team1Id, setTeam1Id] = useState<number | null>(null);
  const [team2Id, setTeam2Id] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: teams } = trpc.teams.list.useQuery();
  const { data: team1 } = trpc.teams.getById.useQuery({ id: team1Id! }, { enabled: !!team1Id });
  const { data: team2 } = trpc.teams.getById.useQuery({ id: team2Id! }, { enabled: !!team2Id });
  const { data: team1Stats } = trpc.teams.getStats.useQuery({ teamId: team1Id! }, { enabled: !!team1Id });
  const { data: team2Stats } = trpc.teams.getStats.useQuery({ teamId: team2Id! }, { enabled: !!team2Id });

  const filteredTeams = teams?.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const comparisonData = team1Stats && team2Stats ? [
    {
      stat: 'Partidas',
      [team1?.name || 'Time 1']: team1Stats.matchesPlayed || 0,
      [team2?.name || 'Time 2']: team2Stats.matchesPlayed || 0,
    },
    {
      stat: 'Vitórias',
      [team1?.name || 'Time 1']: team1Stats.wins || 0,
      [team2?.name || 'Time 2']: team2Stats.wins || 0,
    },
    {
      stat: 'Empates',
      [team1?.name || 'Time 1']: team1Stats.draws || 0,
      [team2?.name || 'Time 2']: team2Stats.draws || 0,
    },
    {
      stat: 'Derrotas',
      [team1?.name || 'Time 1']: team1Stats.losses || 0,
      [team2?.name || 'Time 2']: team2Stats.losses || 0,
    },
    {
      stat: 'Gols Pró',
      [team1?.name || 'Time 1']: team1Stats.goalsFor || 0,
      [team2?.name || 'Time 2']: team2Stats.goalsFor || 0,
    },
    {
      stat: 'Gols Contra',
      [team1?.name || 'Time 1']: team1Stats.goalsAgainst || 0,
      [team2?.name || 'Time 2']: team2Stats.goalsAgainst || 0,
    },
  ] : [];

  const radarData = team1Stats && team2Stats ? [
    {
      stat: 'Vitórias',
      [team1?.name || 'Time 1']: team1Stats.wins || 0,
      [team2?.name || 'Time 2']: team2Stats.wins || 0,
    },
    {
      stat: 'Gols Pró',
      [team1?.name || 'Time 1']: (team1Stats.goalsFor || 0) / 2,
      [team2?.name || 'Time 2']: (team2Stats.goalsFor || 0) / 2,
    },
    {
      stat: 'Média Gols',
      [team1?.name || 'Time 1']: team1Stats.avgGoalsFor || 0,
      [team2?.name || 'Time 2']: team2Stats.avgGoalsFor || 0,
    },
    {
      stat: 'Casa',
      [team1?.name || 'Time 1']: team1Stats.homeWins || 0,
      [team2?.name || 'Time 2']: team2Stats.homeWins || 0,
    },
    {
      stat: 'Fora',
      [team1?.name || 'Time 1']: team1Stats.awayWins || 0,
      [team2?.name || 'Time 2']: team2Stats.awayWins || 0,
    },
  ] : [];

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

          <h1 className="text-4xl font-bold mb-2">Comparar Times</h1>
          <p className="text-muted-foreground">
            Selecione dois times para comparar estatísticas e desempenho
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Team Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Time 1</CardTitle>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="mr-2 h-4 w-4" />
                    {team1 ? team1.name : "Selecione um time"}
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
                              setTeam1Id(team.id);
                              setSearchQuery("");
                            }}
                          >
                            {team.name}
                            {team.country && (
                              <Badge variant="outline" className="ml-2">
                                {team.country}
                              </Badge>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {team1 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {team1.country && `País: ${team1.country}`}
                  </p>
                  {team1.founded && (
                    <p className="text-sm text-muted-foreground">
                      Fundado: {team1.founded}
                    </p>
                  )}
                  {team1.stadium && (
                    <p className="text-sm text-muted-foreground">
                      Estádio: {team1.stadium}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Time 2</CardTitle>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="mr-2 h-4 w-4" />
                    {team2 ? team2.name : "Selecione um time"}
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
                              setTeam2Id(team.id);
                              setSearchQuery("");
                            }}
                          >
                            {team.name}
                            {team.country && (
                              <Badge variant="outline" className="ml-2">
                                {team.country}
                              </Badge>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {team2 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {team2.country && `País: ${team2.country}`}
                  </p>
                  {team2.founded && (
                    <p className="text-sm text-muted-foreground">
                      Fundado: {team2.founded}
                    </p>
                  )}
                  {team2.stadium && (
                    <p className="text-sm text-muted-foreground">
                      Estádio: {team2.stadium}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comparison Results */}
        {team1Stats && team2Stats ? (
          <div className="space-y-8">
            {/* Overall Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas Gerais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    label="Partidas Jogadas"
                    value1={team1Stats.matchesPlayed || 0}
                    value2={team2Stats.matchesPlayed || 0}
                    team1={team1?.name || 'Time 1'}
                    team2={team2?.name || 'Time 2'}
                  />
                  <StatCard
                    label="Vitórias"
                    value1={team1Stats.wins || 0}
                    value2={team2Stats.wins || 0}
                    team1={team1?.name || 'Time 1'}
                    team2={team2?.name || 'Time 2'}
                    highlight
                  />
                  <StatCard
                    label="Empates"
                    value1={team1Stats.draws || 0}
                    value2={team2Stats.draws || 0}
                    team1={team1?.name || 'Time 1'}
                    team2={team2?.name || 'Time 2'}
                  />
                  <StatCard
                    label="Derrotas"
                    value1={team1Stats.losses || 0}
                    value2={team2Stats.losses || 0}
                    team1={team1?.name || 'Time 1'}
                    team2={team2?.name || 'Time 2'}
                    inverse
                  />
                  <StatCard
                    label="Gols Marcados"
                    value1={team1Stats.goalsFor || 0}
                    value2={team2Stats.goalsFor || 0}
                    team1={team1?.name || 'Time 1'}
                    team2={team2?.name || 'Time 2'}
                    highlight
                  />
                  <StatCard
                    label="Gols Sofridos"
                    value1={team1Stats.goalsAgainst || 0}
                    value2={team2Stats.goalsAgainst || 0}
                    team1={team1?.name || 'Time 1'}
                    team2={team2?.name || 'Time 2'}
                    inverse
                  />
                </div>
              </CardContent>
            </Card>

            {/* Home/Away Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Desempenho em Casa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Vitórias</span>
                      <div className="flex gap-4">
                        <span className="font-semibold">{team1Stats.homeWins || 0}</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="font-semibold">{team2Stats.homeWins || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Gols Marcados</span>
                      <div className="flex gap-4">
                        <span className="font-semibold">{team1Stats.homeGoalsFor || 0}</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="font-semibold">{team2Stats.homeGoalsFor || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Gols Sofridos</span>
                      <div className="flex gap-4">
                        <span className="font-semibold">{team1Stats.homeGoalsAgainst || 0}</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="font-semibold">{team2Stats.homeGoalsAgainst || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Desempenho Fora de Casa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Vitórias</span>
                      <div className="flex gap-4">
                        <span className="font-semibold">{team1Stats.awayWins || 0}</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="font-semibold">{team2Stats.awayWins || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Gols Marcados</span>
                      <div className="flex gap-4">
                        <span className="font-semibold">{team1Stats.awayGoalsFor || 0}</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="font-semibold">{team2Stats.awayGoalsFor || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Gols Sofridos</span>
                      <div className="flex gap-4">
                        <span className="font-semibold">{team1Stats.awayGoalsAgainst || 0}</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="font-semibold">{team2Stats.awayGoalsAgainst || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <Card>
              <CardHeader>
                <CardTitle>Comparação Visual</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stat" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey={team1?.name || 'Time 1'} fill="hsl(var(--chart-1))" />
                    <Bar dataKey={team2?.name || 'Time 2'} fill="hsl(var(--chart-2))" />
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
                    <Radar 
                      name={team1?.name || 'Time 1'} 
                      dataKey={team1?.name || 'Time 1'} 
                      stroke="hsl(var(--chart-1))" 
                      fill="hsl(var(--chart-1))" 
                      fillOpacity={0.6} 
                    />
                    <Radar 
                      name={team2?.name || 'Time 2'} 
                      dataKey={team2?.name || 'Time 2'} 
                      stroke="hsl(var(--chart-2))" 
                      fill="hsl(var(--chart-2))" 
                      fillOpacity={0.6} 
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Selecione dois times para começar a comparação
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value1, 
  value2, 
  team1, 
  team2, 
  highlight = false,
  inverse = false
}: { 
  label: string; 
  value1: number; 
  value2: number; 
  team1: string; 
  team2: string; 
  highlight?: boolean;
  inverse?: boolean;
}) {
  const winner = inverse 
    ? (value1 < value2 ? 1 : value1 > value2 ? 2 : 0)
    : (value1 > value2 ? 1 : value1 < value2 ? 2 : 0);

  return (
    <div className={`p-4 rounded-lg border ${highlight ? 'border-primary/50 bg-primary/5' : 'border-border'}`}>
      <p className="text-sm text-muted-foreground mb-3">{label}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${winner === 1 ? 'text-primary' : ''}`}>
            {value1}
          </span>
          {winner === 1 && <TrendingUp className="h-5 w-5 text-primary" />}
          {winner === 2 && <TrendingDown className="h-5 w-5 text-muted-foreground" />}
          {winner === 0 && <Minus className="h-5 w-5 text-muted-foreground" />}
        </div>
        <div className="flex items-center gap-2">
          {winner === 2 && <TrendingUp className="h-5 w-5 text-primary" />}
          {winner === 1 && <TrendingDown className="h-5 w-5 text-muted-foreground" />}
          {winner === 0 && <Minus className="h-5 w-5 text-muted-foreground" />}
          <span className={`text-2xl font-bold ${winner === 2 ? 'text-primary' : ''}`}>
            {value2}
          </span>
        </div>
      </div>
    </div>
  );
}
