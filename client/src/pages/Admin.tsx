import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Database, RefreshCw, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const { data: syncLogs, isLoading, refetch } = trpc.sync.logs.useQuery({ limit: 50 });

  // Check if user is admin
  if (isAuthenticated && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Acesso Negado</h2>
              <p className="text-muted-foreground mb-6">
                Você não tem permissão para acessar esta página.
              </p>
              <Link href="/">
                <Button>Voltar ao Início</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Database className="h-10 w-10 text-primary" />
                Painel de Administração
              </h1>
              <p className="text-muted-foreground">
                Gerencie sincronização de dados e visualize logs do sistema
              </p>
            </div>
            <Button onClick={() => refetch()} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Sincronizações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{syncLogs?.length || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sucesso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {syncLogs?.filter(log => log.status === 'success').length || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Erros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-destructive">
                {syncLogs?.filter(log => log.status === 'error').length || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Progresso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {syncLogs?.filter(log => log.status === 'in_progress').length || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sync Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Como Sincronizar Dados</CardTitle>
            <CardDescription>
              Instruções para importar dados do backend Python para o banco de dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Endpoint de Importação:</h4>
              <code className="text-sm bg-background px-3 py-1 rounded">
                POST /api/trpc/sync.importData
              </code>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Exemplo de Payload:</h4>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "type": "teams",
  "data": [
    {
      "name": "Manchester United",
      "shortName": "Man Utd",
      "country": "England",
      "founded": 1878,
      "stadium": "Old Trafford"
    }
  ],
  "fileName": "teams_import.xlsx"
}`}
              </pre>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
              <p className="text-sm">
                <strong>Tipos suportados:</strong> <code>leagues</code>, <code>teams</code>, <code>matches</code>, <code>stats</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sync Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Logs de Sincronização</CardTitle>
            <CardDescription>
              Histórico de todas as sincronizações de dados realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : syncLogs && syncLogs.length > 0 ? (
              <div className="space-y-3">
                {syncLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {log.status === 'success' && (
                        <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                      )}
                      {log.status === 'error' && (
                        <XCircle className="h-6 w-6 text-destructive flex-shrink-0" />
                      )}
                      {log.status === 'in_progress' && (
                        <Clock className="h-6 w-6 text-blue-600 flex-shrink-0 animate-pulse" />
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{log.fileName}</p>
                          <Badge variant="outline" className="text-xs">
                            {log.tableName}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            Iniciado: {new Date(log.startedAt).toLocaleString('pt-BR')}
                          </span>
                          {log.completedAt && (
                            <span>
                              Concluído: {new Date(log.completedAt).toLocaleString('pt-BR')}
                            </span>
                          )}
                        </div>
                        {log.errorMessage && (
                          <p className="text-sm text-destructive mt-1">
                            Erro: {log.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge
                        variant={
                          log.status === 'success' ? 'default' :
                          log.status === 'error' ? 'destructive' :
                          'secondary'
                        }
                      >
                        {log.status === 'success' ? 'Sucesso' :
                         log.status === 'error' ? 'Erro' :
                         'Em Progresso'}
                      </Badge>
                      {log.rowsProcessed !== null && log.rowsProcessed > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {log.rowsProcessed} registros
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum log de sincronização encontrado
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Integration Guide */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Integração com Backend Python</CardTitle>
            <CardDescription>
              Exemplo de código Python para enviar dados para a API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`import requests
import pandas as pd

# Ler dados do Excel
df = pd.read_excel('teams.xlsx')

# Converter para formato JSON
teams_data = df.to_dict('records')

# Enviar para API
response = requests.post(
    'https://seu-dominio.com/api/trpc/sync.importData',
    json={
        'type': 'teams',
        'data': teams_data,
        'fileName': 'teams.xlsx'
    },
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer SEU_TOKEN'
    }
)

print(response.json())`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
