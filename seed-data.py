#!/usr/bin/env python3
"""
Script para popular o banco de dados com dados de exemplo
Adapte este script para usar seus dados reais do GitHub
"""

import requests
import json
from datetime import datetime, timedelta
import random

# URL da API (ajuste conforme necessário)
API_URL = "http://localhost:3000/api/trpc"

# Dados de exemplo
sample_leagues = [
    {"name": "Premier League", "country": "England", "season": "2023/24"},
    {"name": "La Liga", "country": "Spain", "season": "2023/24"},
    {"name": "Bundesliga", "country": "Germany", "season": "2023/24"},
    {"name": "Serie A", "country": "Italy", "season": "2023/24"},
    {"name": "Ligue 1", "country": "France", "season": "2023/24"},
]

sample_teams = [
    {"name": "Manchester United", "shortName": "Man Utd", "country": "England", "founded": 1878, "stadium": "Old Trafford"},
    {"name": "Manchester City", "shortName": "Man City", "country": "England", "founded": 1880, "stadium": "Etihad Stadium"},
    {"name": "Liverpool", "shortName": "Liverpool", "country": "England", "founded": 1892, "stadium": "Anfield"},
    {"name": "Arsenal", "shortName": "Arsenal", "country": "England", "founded": 1886, "stadium": "Emirates Stadium"},
    {"name": "Chelsea", "shortName": "Chelsea", "country": "England", "founded": 1905, "stadium": "Stamford Bridge"},
    {"name": "Real Madrid", "shortName": "Real Madrid", "country": "Spain", "founded": 1902, "stadium": "Santiago Bernabéu"},
    {"name": "Barcelona", "shortName": "Barcelona", "country": "Spain", "founded": 1899, "stadium": "Camp Nou"},
    {"name": "Bayern Munich", "shortName": "Bayern", "country": "Germany", "founded": 1900, "stadium": "Allianz Arena"},
    {"name": "Juventus", "shortName": "Juventus", "country": "Italy", "founded": 1897, "stadium": "Allianz Stadium"},
    {"name": "Paris Saint-Germain", "shortName": "PSG", "country": "France", "founded": 1970, "stadium": "Parc des Princes"},
]

def send_data(endpoint, data, data_type, filename):
    """Envia dados para a API"""
    url = f"{API_URL}/{endpoint}"
    payload = {
        "type": data_type,
        "data": data,
        "fileName": filename
    }
    
    try:
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
        response.raise_for_status()
        print(f"✓ {filename}: {len(data)} registros importados com sucesso")
        return True
    except requests.exceptions.RequestException as e:
        print(f"✗ Erro ao importar {filename}: {e}")
        return False

def generate_matches(num_matches=20):
    """Gera partidas de exemplo"""
    matches = []
    base_date = datetime.now() - timedelta(days=30)
    
    for i in range(num_matches):
        home_id = random.randint(1, 10)
        away_id = random.randint(1, 10)
        while away_id == home_id:
            away_id = random.randint(1, 10)
        
        match_date = base_date + timedelta(days=i)
        home_score = random.randint(0, 4)
        away_score = random.randint(0, 4)
        
        matches.append({
            "leagueId": random.randint(1, 5),
            "homeTeamId": home_id,
            "awayTeamId": away_id,
            "matchDate": match_date.isoformat(),
            "status": "finished",
            "homeScore": home_score,
            "awayScore": away_score,
            "homeScoreHT": random.randint(0, home_score),
            "awayScoreHT": random.randint(0, away_score),
            "round": f"Rodada {(i % 10) + 1}",
            "venue": f"Stadium {home_id}"
        })
    
    return matches

def generate_team_stats():
    """Gera estatísticas de times"""
    stats = []
    
    for team_id in range(1, 11):
        matches_played = random.randint(20, 38)
        wins = random.randint(5, 25)
        draws = random.randint(3, 10)
        losses = matches_played - wins - draws
        goals_for = random.randint(30, 80)
        goals_against = random.randint(20, 60)
        
        home_matches = matches_played // 2
        home_wins = wins // 2
        home_draws = draws // 2
        home_losses = home_matches - home_wins - home_draws
        
        away_matches = matches_played - home_matches
        away_wins = wins - home_wins
        away_draws = draws - home_draws
        away_losses = away_matches - away_wins - away_draws
        
        stats.append({
            "teamId": team_id,
            "leagueId": random.randint(1, 5),
            "season": "2023/24",
            "matchesPlayed": matches_played,
            "wins": wins,
            "draws": draws,
            "losses": losses,
            "goalsFor": goals_for,
            "goalsAgainst": goals_against,
            "homeMatchesPlayed": home_matches,
            "homeWins": home_wins,
            "homeDraws": home_draws,
            "homeLosses": home_losses,
            "homeGoalsFor": goals_for // 2,
            "homeGoalsAgainst": goals_against // 2,
            "awayMatchesPlayed": away_matches,
            "awayWins": away_wins,
            "awayDraws": away_draws,
            "awayLosses": away_losses,
            "awayGoalsFor": goals_for - (goals_for // 2),
            "awayGoalsAgainst": goals_against - (goals_against // 2),
            "avgGoalsFor": round(goals_for / matches_played, 2) if matches_played > 0 else 0,
            "avgGoalsAgainst": round(goals_against / matches_played, 2) if matches_played > 0 else 0,
            "avgPossession": random.randint(40, 60)
        })
    
    return stats

def generate_match_stats(num_matches=20):
    """Gera estatísticas de partidas"""
    stats = []
    
    for match_id in range(1, num_matches + 1):
        # Estatísticas do time da casa
        stats.append({
            "matchId": match_id,
            "teamId": random.randint(1, 10),
            "isHome": True,
            "shotsTotal": random.randint(8, 20),
            "shotsOnTarget": random.randint(3, 10),
            "shotsOffTarget": random.randint(2, 8),
            "shotsBlocked": random.randint(1, 5),
            "shotsInsideBox": random.randint(5, 15),
            "shotsOutsideBox": random.randint(2, 8),
            "possession": random.randint(45, 65),
            "passesTotal": random.randint(300, 600),
            "passesAccurate": random.randint(250, 500),
            "passesAccuracyPercent": random.randint(75, 92),
            "tackles": random.randint(10, 25),
            "blocks": random.randint(2, 8),
            "interceptions": random.randint(5, 15),
            "clearances": random.randint(10, 25),
            "foulsCommitted": random.randint(8, 18),
            "foulsDrawn": random.randint(8, 18),
            "yellowCards": random.randint(0, 4),
            "redCards": random.randint(0, 1),
            "corners": random.randint(3, 12),
            "offsides": random.randint(0, 5),
            "saves": random.randint(2, 8)
        })
        
        # Estatísticas do time visitante
        stats.append({
            "matchId": match_id,
            "teamId": random.randint(1, 10),
            "isHome": False,
            "shotsTotal": random.randint(8, 20),
            "shotsOnTarget": random.randint(3, 10),
            "shotsOffTarget": random.randint(2, 8),
            "shotsBlocked": random.randint(1, 5),
            "shotsInsideBox": random.randint(5, 15),
            "shotsOutsideBox": random.randint(2, 8),
            "possession": random.randint(35, 55),
            "passesTotal": random.randint(300, 600),
            "passesAccurate": random.randint(250, 500),
            "passesAccuracyPercent": random.randint(75, 92),
            "tackles": random.randint(10, 25),
            "blocks": random.randint(2, 8),
            "interceptions": random.randint(5, 15),
            "clearances": random.randint(10, 25),
            "foulsCommitted": random.randint(8, 18),
            "foulsDrawn": random.randint(8, 18),
            "yellowCards": random.randint(0, 4),
            "redCards": random.randint(0, 1),
            "corners": random.randint(3, 12),
            "offsides": random.randint(0, 5),
            "saves": random.randint(2, 8)
        })
    
    return stats

def main():
    print("=" * 60)
    print("FootyStats - Script de População de Dados")
    print("=" * 60)
    print()
    
    print("AVISO: Este script usa dados de exemplo.")
    print("Para usar dados reais, adapte o script para ler seus arquivos Excel.")
    print()
    
    # Importar ligas
    print("1. Importando ligas...")
    send_data("sync.importData", sample_leagues, "leagues", "sample_leagues.json")
    
    # Importar times
    print("\n2. Importando times...")
    send_data("sync.importData", sample_teams, "teams", "sample_teams.json")
    
    # Gerar e importar partidas
    print("\n3. Gerando e importando partidas...")
    matches = generate_matches(20)
    send_data("sync.importData", matches, "matches", "sample_matches.json")
    
    # Gerar e importar estatísticas de times
    print("\n4. Gerando e importando estatísticas de times...")
    team_stats = generate_team_stats()
    # Nota: você precisará adicionar um endpoint para team_stats ou usar outro método
    print("   (Estatísticas de times devem ser calculadas a partir das partidas)")
    
    # Gerar e importar estatísticas de partidas
    print("\n5. Gerando e importando estatísticas de partidas...")
    match_stats = generate_match_stats(20)
    send_data("sync.importData", match_stats, "stats", "sample_match_stats.json")
    
    print("\n" + "=" * 60)
    print("Importação concluída!")
    print("=" * 60)
    print("\nAcesse http://localhost:3000 para ver os dados importados.")

if __name__ == "__main__":
    main()
