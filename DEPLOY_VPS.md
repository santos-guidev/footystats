# Guia Completo de Deploy em VPS Ubuntu - FootyStats

Este guia fornece instruções detalhadas e passo a passo para fazer o deploy da plataforma FootyStats em um servidor VPS Ubuntu, desde a configuração inicial do servidor até a configuração de Nginx como reverse proxy e PM2 para gerenciamento de processos.

## Visão Geral da Arquitetura

A arquitetura de deploy consiste em três componentes principais trabalhando em conjunto. O **PM2** gerencia o processo Node.js da aplicação, garantindo que ela permaneça em execução e reinicie automaticamente em caso de falhas. O **Nginx** atua como reverse proxy, recebendo requisições HTTP/HTTPS na porta 80/443 e encaminhando para a aplicação Node.js rodando na porta 3000. O **MySQL** armazena todos os dados da aplicação, incluindo ligas, times, partidas e estatísticas.

## Pré-requisitos do Servidor

Antes de iniciar o processo de deploy, você precisará de um servidor VPS com as seguintes especificações mínimas recomendadas:

| Especificação | Mínimo Recomendado | Ideal |
|---------------|-------------------|-------|
| Sistema Operacional | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| RAM | 2 GB | 4 GB ou mais |
| CPU | 1 vCore | 2 vCores ou mais |
| Armazenamento | 20 GB SSD | 40 GB SSD ou mais |
| Largura de Banda | 1 TB/mês | Ilimitado |

Você também precisará de acesso SSH ao servidor com privilégios sudo e um domínio apontando para o IP do servidor (opcional, mas recomendado para HTTPS).

## Configuração Inicial do Servidor

### Conectando ao Servidor via SSH

Primeiro, conecte-se ao seu servidor VPS usando SSH. Abra um terminal em sua máquina local e execute:

```bash
ssh root@SEU_IP_DO_SERVIDOR
```

Substitua `SEU_IP_DO_SERVIDOR` pelo endereço IP real do seu VPS. Se você configurou autenticação por chave SSH, será conectado automaticamente. Caso contrário, digite a senha quando solicitado.

### Atualizando o Sistema

Após conectar, a primeira etapa é atualizar todos os pacotes do sistema para as versões mais recentes. Execute os seguintes comandos:

```bash
sudo apt update
sudo apt upgrade -y
```

O primeiro comando atualiza a lista de pacotes disponíveis, enquanto o segundo instala as atualizações. O flag `-y` confirma automaticamente todas as prompts.

### Criando Usuário Não-Root

Por questões de segurança, é recomendado não usar o usuário root para operações diárias. Crie um novo usuário com privilégios sudo:

```bash
adduser footystats
usermod -aG sudo footystats
```

O primeiro comando cria o usuário e solicita que você defina uma senha. O segundo adiciona o usuário ao grupo sudo, concedendo privilégios administrativos. Após criar o usuário, faça logout e reconecte usando o novo usuário:

```bash
ssh footystats@SEU_IP_DO_SERVIDOR
```

### Configurando Firewall

Configure o firewall UFW (Uncomplicated Firewall) para permitir apenas as portas necessárias:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

Estes comandos permitem conexões SSH (porta 22), HTTP (porta 80) e HTTPS (porta 443). Verifique o status com `sudo ufw status`.

## Instalando Dependências

### Instalando Node.js

O FootyStats requer Node.js versão 22.x. Instale usando o repositório NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

Verifique a instalação:

```bash
node --version  # Deve mostrar v22.x.x
npm --version   # Deve mostrar 10.x.x ou superior
```

### Instalando pnpm

O projeto utiliza pnpm como gerenciador de pacotes. Instale-o globalmente:

```bash
sudo npm install -g pnpm
pnpm --version  # Deve mostrar 10.x.x ou superior
```

### Instalando Git

Git é necessário para clonar o repositório:

```bash
sudo apt install -y git
git --version
```

### Instalando MySQL

Instale o MySQL Server para o banco de dados:

```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

Execute o script de segurança para configurar senha root e remover configurações inseguras:

```bash
sudo mysql_secure_installation
```

Siga as prompts e responda:
- Set root password? **Y** (defina uma senha forte)
- Remove anonymous users? **Y**
- Disallow root login remotely? **Y**
- Remove test database? **Y**
- Reload privilege tables? **Y**

### Criando Banco de Dados

Conecte ao MySQL e crie o banco de dados para a aplicação:

```bash
sudo mysql -u root -p
```

No prompt do MySQL, execute:

```sql
CREATE DATABASE footystats CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'footystats_user'@'localhost' IDENTIFIED BY 'SUA_SENHA_FORTE_AQUI';
GRANT ALL PRIVILEGES ON footystats.* TO 'footystats_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Substitua `SUA_SENHA_FORTE_AQUI` por uma senha segura. Anote estas credenciais pois serão necessárias na configuração da aplicação.

## Configurando o Repositório Git

### Gerando Chave SSH para GitHub

Se seu repositório é privado, você precisará configurar autenticação SSH. Gere uma chave SSH no servidor:

```bash
ssh-keygen -t ed25519 -C "seu_email@example.com"
```

Pressione Enter para aceitar o local padrão e opcionalmente defina uma passphrase. Exiba a chave pública:

```bash
cat ~/.ssh/id_ed25519.pub
```

Copie o conteúdo e adicione como Deploy Key no seu repositório GitHub em **Settings > Deploy Keys > Add deploy key**.

### Clonando o Repositório

Clone o repositório para o diretório home do usuário:

```bash
cd ~
git clone git@github.com:SEU_USUARIO/footystats-web.git
cd footystats-web
```

Substitua `SEU_USUARIO` pelo seu usuário GitHub e ajuste a URL conforme necessário.

## Configurando a Aplicação

### Criando Arquivo de Ambiente

Crie o arquivo `.env` com as configurações de produção:

```bash
nano .env
```

Adicione o seguinte conteúdo, ajustando os valores conforme necessário:

```env
# Ambiente
NODE_ENV=production

# Servidor
PORT=3000
HOST=0.0.0.0

# Banco de Dados
DATABASE_URL=mysql://footystats_user:SUA_SENHA_FORTE_AQUI@localhost:3306/footystats

# Autenticação (fornecido pela plataforma Manus ou configure seu próprio)
JWT_SECRET=gere_um_secret_aleatorio_longo_e_seguro_aqui
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=seu_app_id_aqui

# Aplicação
VITE_APP_TITLE=FootyStats
VITE_APP_LOGO=/logo.png
```

Para gerar um JWT_SECRET seguro, use:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Salve o arquivo pressionando `Ctrl+X`, depois `Y` e `Enter`.

### Instalando Dependências do Projeto

Instale todas as dependências do projeto:

```bash
pnpm install --frozen-lockfile
```

O flag `--frozen-lockfile` garante que as versões exatas especificadas no `pnpm-lock.yaml` sejam instaladas.

### Executando Migrações do Banco de Dados

Aplique as migrações para criar as tabelas no banco de dados:

```bash
pnpm db:push
```

Você deve ver mensagens confirmando que as tabelas foram criadas com sucesso.

### Compilando a Aplicação

Compile o código TypeScript e o frontend React para produção:

```bash
pnpm build
```

Este comando gera os arquivos otimizados no diretório `dist/`. O processo pode levar alguns minutos.

## Configurando PM2

PM2 é um gerenciador de processos para aplicações Node.js que mantém a aplicação rodando continuamente e reinicia automaticamente em caso de falhas ou reinicializações do servidor.

### Instalando PM2

Instale o PM2 globalmente:

```bash
sudo npm install -g pm2
```

### Criando Arquivo de Configuração PM2

Crie um arquivo de configuração PM2 na raiz do projeto:

```bash
nano ecosystem.config.js
```

Adicione o seguinte conteúdo:

```javascript
module.exports = {
  apps: [{
    name: 'footystats',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M'
  }]
};
```

Esta configuração inicia a aplicação em modo cluster, utilizando todos os núcleos da CPU disponíveis para melhor performance.

### Iniciando a Aplicação com PM2

Crie o diretório de logs e inicie a aplicação:

```bash
mkdir -p logs
pm2 start ecosystem.config.js
```

Verifique o status:

```bash
pm2 status
```

Você deve ver a aplicação `footystats` com status `online`. Para ver os logs em tempo real:

```bash
pm2 logs footystats
```

### Configurando PM2 para Iniciar no Boot

Configure o PM2 para iniciar automaticamente quando o servidor reiniciar:

```bash
pm2 startup
```

Este comando exibirá um comando que você deve copiar e executar. Será algo como:

```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u footystats --hp /home/footystats
```

Após executar o comando exibido, salve a configuração atual do PM2:

```bash
pm2 save
```

Agora o PM2 iniciará automaticamente após reinicializações do servidor e restaurará todas as aplicações gerenciadas.

## Configurando Nginx

Nginx atuará como reverse proxy, recebendo requisições HTTP/HTTPS e encaminhando para a aplicação Node.js.

### Instalando Nginx

Instale o Nginx:

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

Verifique se o Nginx está rodando acessando `http://SEU_IP_DO_SERVIDOR` no navegador. Você deve ver a página padrão do Nginx.

### Criando Configuração do Site

Crie um arquivo de configuração para o FootyStats:

```bash
sudo nano /etc/nginx/sites-available/footystats
```

Adicione a seguinte configuração (substitua `seu-dominio.com` pelo seu domínio real):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Logs
    access_log /var/log/nginx/footystats-access.log;
    error_log /var/log/nginx/footystats-error.log;

    # Proxy para aplicação Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Compressão
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Se você não tem um domínio, substitua `server_name` pelo IP do servidor:

```nginx
server_name SEU_IP_DO_SERVIDOR;
```

### Ativando o Site

Crie um link simbólico para ativar o site:

```bash
sudo ln -s /etc/nginx/sites-available/footystats /etc/nginx/sites-enabled/
```

Teste a configuração do Nginx:

```bash
sudo nginx -t
```

Se não houver erros, recarregue o Nginx:

```bash
sudo systemctl reload nginx
```

Agora você pode acessar a aplicação em `http://seu-dominio.com` ou `http://SEU_IP_DO_SERVIDOR`.

## Configurando HTTPS com Let's Encrypt

Para habilitar HTTPS e garantir conexões seguras, use o Let's Encrypt para obter um certificado SSL gratuito.

### Instalando Certbot

Instale o Certbot e o plugin Nginx:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtendo Certificado SSL

Execute o Certbot para obter e instalar automaticamente o certificado:

```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

Siga as prompts:
- Digite seu email para notificações importantes
- Aceite os termos de serviço
- Escolha se deseja compartilhar seu email com a EFF (opcional)
- Quando perguntado sobre redirecionamento HTTP para HTTPS, escolha **2** (Redirect)

O Certbot modificará automaticamente a configuração do Nginx para incluir SSL e configurar redirecionamento de HTTP para HTTPS.

### Renovação Automática

O Certbot instala um timer systemd para renovação automática. Verifique se está ativo:

```bash
sudo systemctl status certbot.timer
```

Teste a renovação:

```bash
sudo certbot renew --dry-run
```

Se o teste for bem-sucedido, os certificados serão renovados automaticamente antes de expirarem.

## Populando o Banco de Dados

Com a aplicação rodando, você pode popular o banco de dados com dados iniciais.

### Usando o Script Python de Exemplo

O projeto inclui um script Python para popular dados de exemplo:

```bash
cd ~/footystats-web
python3 seed-data.py
```

Este script enviará dados de exemplo para a API. Ajuste o script para usar seus dados reais do GitHub.

### Integrando com Backend Python Existente

Para integrar com seu backend Python existente que sincroniza dados do GitHub, modifique o script `fetch_and_upsert.py` para enviar dados para a nova API:

```python
import requests

def sync_to_api(data_type, data, filename):
    url = "https://seu-dominio.com/api/trpc/sync.importData"
    payload = {
        "type": data_type,
        "data": data,
        "fileName": filename
    }
    response = requests.post(url, json=payload)
    return response.json()
```

Configure um cron job para executar a sincronização periodicamente:

```bash
crontab -e
```

Adicione a linha:

```cron
0 0 * * * cd /home/footystats/footystats-project && /usr/bin/python3 scripts/fetch_and_upsert.py >> /home/footystats/logs/sync.log 2>&1
```

Isto executará a sincronização todos os dias à meia-noite.

## Monitoramento e Manutenção

### Monitorando a Aplicação com PM2

O PM2 oferece várias ferramentas de monitoramento. Para ver estatísticas em tempo real:

```bash
pm2 monit
```

Para ver logs:

```bash
pm2 logs footystats --lines 100
```

Para reiniciar a aplicação após mudanças:

```bash
pm2 restart footystats
```

### Monitorando Nginx

Verifique logs de acesso e erro do Nginx:

```bash
sudo tail -f /var/log/nginx/footystats-access.log
sudo tail -f /var/log/nginx/footystats-error.log
```

### Backup do Banco de Dados

Configure backups automáticos do banco de dados MySQL. Crie um script de backup:

```bash
mkdir -p ~/backups
nano ~/backup-db.sh
```

Adicione o conteúdo:

```bash
#!/bin/bash
BACKUP_DIR="/home/footystats/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/footystats_$DATE.sql.gz"

mysqldump -u footystats_user -p'SUA_SENHA' footystats | gzip > $BACKUP_FILE

# Manter apenas backups dos últimos 7 dias
find $BACKUP_DIR -name "footystats_*.sql.gz" -mtime +7 -delete

echo "Backup concluído: $BACKUP_FILE"
```

Torne o script executável:

```bash
chmod +x ~/backup-db.sh
```

Configure um cron job para executar diariamente:

```bash
crontab -e
```

Adicione:

```cron
0 2 * * * /home/footystats/backup-db.sh >> /home/footystats/logs/backup.log 2>&1
```

### Atualizando a Aplicação

Quando houver atualizações no código, siga este processo:

```bash
cd ~/footystats-web
git pull origin main
pnpm install --frozen-lockfile
pnpm build
pm2 restart footystats
```

Para mudanças no banco de dados, execute também:

```bash
pnpm db:push
```

## Otimizações de Performance

### Configurando Cache no Nginx

Adicione cache de arquivos estáticos na configuração do Nginx:

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Otimizando MySQL

Edite a configuração do MySQL para melhor performance:

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Adicione ou ajuste estas configurações na seção `[mysqld]`:

```ini
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 200
query_cache_size = 32M
query_cache_type = 1
```

Reinicie o MySQL:

```bash
sudo systemctl restart mysql
```

### Configurando Swap (se necessário)

Se seu servidor tem pouca RAM, configure swap para evitar problemas de memória:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Solução de Problemas

### Aplicação Não Inicia

Se a aplicação não iniciar, verifique os logs do PM2:

```bash
pm2 logs footystats --err
```

Problemas comuns incluem erro de conexão com banco de dados (verifique credenciais no `.env`), porta 3000 já em uso (mude a porta ou mate o processo conflitante), e falta de permissões (certifique-se de que o usuário tem permissão para ler os arquivos).

### Erro 502 Bad Gateway no Nginx

Este erro indica que o Nginx não consegue se conectar à aplicação Node.js. Verifique se a aplicação está rodando com `pm2 status` e confirme que a porta no Nginx (3000) corresponde à porta da aplicação no `.env`.

### Certificado SSL Não Renova

Se a renovação automática falhar, renove manualmente:

```bash
sudo certbot renew --force-renewal
```

Verifique os logs em `/var/log/letsencrypt/` para detalhes do erro.

### Performance Lenta

Se a aplicação estiver lenta, verifique uso de recursos com `htop` (instale com `sudo apt install htop`). Considere aumentar recursos do servidor, otimizar consultas ao banco de dados adicionando índices, e implementar cache com Redis.

## Segurança Adicional

### Configurando Fail2Ban

Fail2Ban protege contra ataques de força bruta bloqueando IPs após múltiplas tentativas falhadas:

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

Crie uma configuração para SSH:

```bash
sudo nano /etc/fail2ban/jail.local
```

Adicione:

```ini
[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
```

Reinicie o Fail2Ban:

```bash
sudo systemctl restart fail2ban
```

### Atualizações Automáticas de Segurança

Configure atualizações automáticas de segurança:

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

Selecione **Yes** quando perguntado sobre instalar atualizações de segurança automaticamente.

## Conclusão

Seguindo este guia, você configurou com sucesso um ambiente de produção completo para a plataforma FootyStats em um servidor VPS Ubuntu. A aplicação está rodando com PM2 para gerenciamento de processos, Nginx como reverse proxy com HTTPS habilitado, e MySQL como banco de dados.

Para manutenção contínua, monitore regularmente os logs da aplicação e do servidor, mantenha backups atualizados do banco de dados, aplique atualizações de segurança prontamente, e monitore métricas de performance para identificar gargalos.

Com esta infraestrutura robusta, sua plataforma de análise de futebol está pronta para servir usuários de forma confiável e segura.

---

**Autor**: Manus AI  
**Última Atualização**: Dezembro 2024
