# Guia de Desenvolvimento no VSCode - FootyStats

Este documento fornece instruções detalhadas para configurar o ambiente de desenvolvimento da plataforma FootyStats no Visual Studio Code, desde a instalação inicial até o fluxo de trabalho completo de desenvolvimento.

## Pré-requisitos

Antes de iniciar o desenvolvimento, certifique-se de ter os seguintes softwares instalados em sua máquina:

### Softwares Necessários

**Node.js** (versão 22.x ou superior) é o runtime JavaScript necessário para executar o projeto. Você pode baixar a versão LTS mais recente do site oficial em [nodejs.org](https://nodejs.org/). Para verificar se o Node.js está instalado corretamente, execute o comando `node --version` no terminal.

**pnpm** (versão 10.x ou superior) é o gerenciador de pacotes utilizado neste projeto. Após instalar o Node.js, instale o pnpm globalmente com o comando `npm install -g pnpm`. Verifique a instalação com `pnpm --version`.

**Git** é essencial para controle de versão e colaboração. Baixe e instale a partir de [git-scm.com](https://git-scm.com/). Confirme a instalação com `git --version`.

**Visual Studio Code** é o editor de código recomendado para este projeto. Faça o download em [code.visualstudio.com](https://code.visualstudio.com/).

**MySQL/TiDB** (versão 8.0 ou superior) é o banco de dados utilizado. Você pode instalar o MySQL Community Server localmente ou usar um serviço em nuvem. Anote as credenciais de acesso (usuário, senha, host, porta) pois serão necessárias na configuração.

## Configuração Inicial do Projeto

### Clonando o Repositório

Primeiro, clone o repositório do projeto para sua máquina local. Abra o terminal e navegue até o diretório onde deseja armazenar o projeto, então execute:

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd footystats-web
```

Substitua `<URL_DO_SEU_REPOSITORIO>` pela URL real do seu repositório Git.

### Abrindo no VSCode

Abra o projeto no Visual Studio Code executando o comando `code .` dentro do diretório do projeto, ou abra o VSCode e use **File > Open Folder** para selecionar a pasta do projeto.

### Instalando Extensões Recomendadas

Para uma experiência de desenvolvimento otimizada, instale as seguintes extensões no VSCode:

- **ESLint** (dbaeumer.vscode-eslint) - Linting e formatação de código JavaScript/TypeScript
- **Prettier** (esbenp.prettier-vscode) - Formatação automática de código
- **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss) - Autocompletar classes Tailwind
- **Path Intellisense** (christian-kohler.path-intellisense) - Autocompletar caminhos de arquivos
- **GitLens** (eamodio.gitlens) - Visualização avançada de histórico Git
- **Thunder Client** (rangav.vscode-thunder-client) - Cliente REST para testar APIs

Você pode instalar essas extensões através da aba Extensions (Ctrl+Shift+X) no VSCode.

### Configurando Variáveis de Ambiente

O projeto utiliza variáveis de ambiente para configuração sensível. Crie um arquivo `.env` na raiz do projeto baseado no exemplo fornecido:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure as seguintes variáveis essenciais:

```env
# Banco de Dados
DATABASE_URL=mysql://usuario:senha@localhost:3306/footystats

# Aplicação
NODE_ENV=development
PORT=3000

# Autenticação (fornecido pela plataforma Manus)
JWT_SECRET=seu_jwt_secret_aqui
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
```

Substitua `usuario`, `senha` e `footystats` pelas credenciais reais do seu banco de dados MySQL.

### Instalando Dependências

Com o arquivo `.env` configurado, instale todas as dependências do projeto executando:

```bash
pnpm install
```

Este comando instalará todas as dependências listadas no `package.json`, incluindo React, TypeScript, tRPC, Drizzle ORM, Tailwind CSS e outras bibliotecas necessárias.

### Configurando o Banco de Dados

Após instalar as dependências, é necessário criar as tabelas no banco de dados. Execute o comando de migração:

```bash
pnpm db:push
```

Este comando irá:
1. Gerar os arquivos de migração SQL baseados no schema definido em `drizzle/schema.ts`
2. Aplicar as migrações ao banco de dados configurado

Se o comando for executado com sucesso, você verá uma mensagem confirmando que as migrações foram aplicadas.

## Estrutura do Projeto

Compreender a estrutura de diretórios é fundamental para navegar e desenvolver no projeto de forma eficiente.

### Diretórios Principais

**`client/`** contém todo o código do frontend React. Dentro dele, `client/src/pages/` armazena os componentes de página (Home, MatchDetail, CompareTeams, Simulator, Admin), `client/src/components/` contém componentes reutilizáveis e componentes UI do shadcn/ui, `client/src/lib/` possui utilitários e configuração do tRPC, e `client/src/contexts/` gerencia contextos React como tema.

**`server/`** contém o código do backend Express. Os arquivos principais são `server/routers.ts` que define todos os endpoints tRPC, `server/db.ts` com funções de consulta ao banco de dados, e `server/_core/` que contém configurações internas do framework.

**`drizzle/`** gerencia o schema e migrações do banco de dados. O arquivo `drizzle/schema.ts` define todas as tabelas e seus relacionamentos, enquanto as migrações geradas ficam em arquivos SQL numerados.

**`shared/`** contém código compartilhado entre frontend e backend, como constantes e tipos TypeScript.

### Arquivos de Configuração Importantes

**`package.json`** define scripts, dependências e metadados do projeto. Os scripts principais são `dev` para desenvolvimento, `build` para produção, `db:push` para migrações e `test` para executar testes.

**`tsconfig.json`** configura o compilador TypeScript com paths aliases como `@/` apontando para `client/src/`.

**`tailwind.config.js`** configura o Tailwind CSS com tema personalizado e plugins.

**`drizzle.config.ts`** configura o Drizzle ORM com conexão ao banco de dados e diretório de schemas.

## Fluxo de Trabalho de Desenvolvimento

### Iniciando o Servidor de Desenvolvimento

Para iniciar o ambiente de desenvolvimento completo, execute:

```bash
pnpm dev
```

Este comando inicia simultaneamente:
- Servidor backend Express na porta 3000
- Hot reload para mudanças no código do servidor
- Vite dev server para o frontend com HMR (Hot Module Replacement)
- Compilador TypeScript em modo watch

Acesse a aplicação em `http://localhost:3000`. Qualquer mudança no código será refletida automaticamente no navegador.

### Desenvolvendo Novas Funcionalidades

O desenvolvimento de novas funcionalidades geralmente segue este fluxo:

#### 1. Definir Schema do Banco de Dados

Se sua funcionalidade requer novos dados, primeiro defina as tabelas em `drizzle/schema.ts`. Por exemplo, para adicionar uma tabela de jogadores:

```typescript
export const players = mysqlTable("players", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  teamId: int("teamId").references(() => teams.id),
  position: varchar("position", { length: 50 }),
  number: int("number"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```

Após definir o schema, execute `pnpm db:push` para aplicar as mudanças ao banco de dados.

#### 2. Criar Funções de Consulta

Em `server/db.ts`, adicione funções para consultar os novos dados:

```typescript
export async function getPlayersByTeam(teamId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(players)
    .where(eq(players.teamId, teamId))
    .orderBy(players.number);
}
```

#### 3. Criar Endpoints tRPC

Em `server/routers.ts`, adicione novos procedures para expor a funcionalidade:

```typescript
players: router({
  byTeam: publicProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ input }) => {
      return await db.getPlayersByTeam(input.teamId);
    }),
}),
```

#### 4. Criar Componentes de Interface

Crie novos componentes em `client/src/pages/` ou `client/src/components/`. Use os hooks tRPC para consumir os dados:

```typescript
import { trpc } from "@/lib/trpc";

function TeamPlayers({ teamId }: { teamId: number }) {
  const { data: players, isLoading } = trpc.players.byTeam.useQuery({ teamId });
  
  if (isLoading) return <Skeleton />;
  
  return (
    <div>
      {players?.map(player => (
        <div key={player.id}>{player.name}</div>
      ))}
    </div>
  );
}
```

#### 5. Adicionar Rotas

Se criou uma nova página, adicione a rota em `client/src/App.tsx`:

```typescript
<Route path="/team/:id/players" component={TeamPlayers} />
```

### Testando a Aplicação

O projeto utiliza Vitest para testes. Para executar os testes:

```bash
pnpm test
```

Para criar novos testes, adicione arquivos `*.test.ts` no diretório `server/`. Exemplo de teste para um procedure:

```typescript
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("players.byTeam", () => {
  it("retorna jogadores do time", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.players.byTeam({ teamId: 1 });
    
    expect(result).toBeInstanceOf(Array);
  });
});
```

### Debugging no VSCode

Configure o debugging criando `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "skipFiles": ["<node_internals>/**"],
      "console": "integratedTerminal"
    }
  ]
}
```

Pressione F5 para iniciar o debugging. Você pode adicionar breakpoints clicando na margem esquerda do editor.

## Trabalhando com o Backend Python

O projeto foi projetado para integrar com o backend Python existente que sincroniza dados do GitHub.

### Estrutura do Backend Python Original

O backend Python localizado em `/home/ubuntu/footystats-project/` possui os seguintes componentes principais:

- `scripts/fetch_and_upsert.py` - Baixa arquivos Excel do GitHub e sincroniza com PostgreSQL
- `scripts/consolidate.py` - Consolida dados de múltiplas tabelas
- `app/streamlit_app.py` - Interface Streamlit (substituída pela aplicação web)

### Adaptando para a Nova API

Para enviar dados do backend Python para a nova aplicação web, modifique o script de sincronização para usar a API REST:

```python
import requests
import pandas as pd

def sync_to_web_api(data_type, data, filename):
    """Envia dados para a API web"""
    url = "http://localhost:3000/api/trpc/sync.importData"
    
    payload = {
        "type": data_type,  # 'leagues', 'teams', 'matches', 'stats'
        "data": data,
        "fileName": filename
    }
    
    response = requests.post(url, json=payload)
    response.raise_for_status()
    return response.json()

# Exemplo de uso
df = pd.read_excel('teams.xlsx')
teams_data = df.to_dict('records')
result = sync_to_web_api('teams', teams_data, 'teams.xlsx')
print(f"Importados {result['processed']} registros")
```

### Script de População de Dados

Um script Python de exemplo (`seed-data.py`) está incluído na raiz do projeto para popular o banco de dados com dados de teste. Execute-o com:

```bash
python3 seed-data.py
```

Este script pode ser adaptado para usar seus dados reais do GitHub.

## Boas Práticas de Desenvolvimento

### Convenções de Código

Mantenha consistência no código seguindo estas convenções. Use **camelCase** para variáveis e funções JavaScript/TypeScript, **PascalCase** para componentes React e tipos TypeScript, e **kebab-case** para nomes de arquivos. Sempre adicione tipos TypeScript explícitos em funções e interfaces.

### Commits Git

Faça commits frequentes e descritivos seguindo o padrão Conventional Commits. Exemplos de mensagens de commit apropriadas incluem `feat: adicionar página de estatísticas de jogadores`, `fix: corrigir cálculo de probabilidades no simulador`, `docs: atualizar guia de desenvolvimento`, e `refactor: extrair lógica de gráficos para componente reutilizável`.

### Organização de Componentes

Mantenha componentes pequenos e focados em uma única responsabilidade. Extraia lógica complexa para hooks customizados em `client/src/hooks/`. Use componentes do shadcn/ui sempre que possível para manter consistência visual. Organize estilos usando classes Tailwind CSS em vez de CSS customizado.

### Performance

Para garantir boa performance, sempre use `React.memo` para componentes que renderizam listas grandes. Implemente paginação ou scroll infinito para conjuntos de dados extensos. Use `useMemo` e `useCallback` para otimizar re-renders desnecessários. No backend, adicione índices no banco de dados para colunas frequentemente consultadas.

## Solução de Problemas Comuns

### Erro de Conexão com Banco de Dados

Se você encontrar erros de conexão com o banco de dados, verifique se o MySQL está rodando com `sudo systemctl status mysql`. Confirme que as credenciais em `.env` estão corretas e que o banco de dados `footystats` foi criado. Teste a conexão manualmente com `mysql -u usuario -p`.

### Porta 3000 Já em Uso

Se a porta 3000 estiver ocupada, você pode alterar a porta no arquivo `.env` adicionando `PORT=3001` ou matar o processo que está usando a porta com `lsof -ti:3000 | xargs kill -9`.

### Erros de TypeScript

Erros de tipo geralmente indicam inconsistências entre o schema do banco e os tipos gerados. Execute `pnpm db:push` novamente para regenerar os tipos. Limpe o cache do TypeScript com `rm -rf node_modules/.cache` e reinicie o VSCode.

### Hot Reload Não Funciona

Se mudanças no código não refletem no navegador, tente limpar o cache do Vite com `rm -rf node_modules/.vite` e reiniciar o servidor de desenvolvimento. Verifique também se há erros no console do navegador ou terminal.

## Recursos Adicionais

Para aprofundar seus conhecimentos nas tecnologias utilizadas, consulte as documentações oficiais:

- **React 19**: [react.dev](https://react.dev/)
- **TypeScript**: [typescriptlang.org](https://www.typescriptlang.org/)
- **tRPC**: [trpc.io](https://trpc.io/)
- **Drizzle ORM**: [orm.drizzle.team](https://orm.drizzle.team/)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com/)
- **Recharts**: [recharts.org](https://recharts.org/)
- **shadcn/ui**: [ui.shadcn.com](https://ui.shadcn.com/)

---

**Autor**: Manus AI  
**Última Atualização**: Dezembro 2024
