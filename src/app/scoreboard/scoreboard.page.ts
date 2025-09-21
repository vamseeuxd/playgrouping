import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonBackButton,
  IonButtons,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../services/firestore.service';
import { APP_CONSTANTS } from '../constants/app.constants';
import { TeamStandingsComponent } from '../components/scoreboard/team-standings.component';
import { PlayerStandingsComponent } from '../components/scoreboard/player-standings.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Match, MatchWithTeams, Team, TeamPlayerWithUser, MatchPlayer } from '../interfaces';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.page.html',
  styleUrls: ['./scoreboard.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonBackButton,
    IonButtons,
    TeamStandingsComponent,
    PlayerStandingsComponent,
  ],
})
export class ScoreboardPage {
  private route = inject(ActivatedRoute);
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);
  private router = inject(Router);
  tournamentId = '';

  teams: (Team & { players: TeamPlayerWithUser[] })[] = [];
  matches: MatchWithTeams[] = [];
  teamStats: any[] = [];
  playerStats: any[] = [];

  constructor() {
    this.tournamentId = this.route.snapshot.params['id'];
    
    // Check for view access via QR code
    const accessParam = this.route.snapshot.queryParams['access'];
    if (accessParam === 'view') {
      this.authService.setViewAccess(this.tournamentId);
    }
    
    // Allow access to scoreboard for all users (authenticated or not)
    this.loadData();
  }

  loadData() {
    if (this.tournamentId) {
      // Load teams with players
      this.firestoreService.getTeamsWithPlayers(this.tournamentId).then((teams) => {
        this.teams = teams;
        this.calculateStats();
      });

      // Load matches
      this.firestoreService.getMatches(this.tournamentId).subscribe(async (matches) => {
        this.matches = await this.firestoreService.getMatchesWithTeams(this.tournamentId);
        this.calculateStats();
      });
    }
  }

  calculateStats() {
    if (this.teams.length === 0 || this.matches.length === 0) return;

    this.calculateTeamStats();
    this.calculatePlayerStats();
  }

  calculateTeamStats() {
    this.teamStats = this.teams.map((team) => {
      const teamName = team.name;
      let played = 0;
      let won = 0;
      let drawn = 0;
      let lost = 0;
      let goalsFor = 0;
      let goalsAgainst = 0;

      this.matches.forEach((match) => {
        if (
          match.status === APP_CONSTANTS.MATCH.STATUS.FINISHED &&
          (match.team1Name === teamName || match.team2Name === teamName)
        ) {
          played++;

          if (match.team1Name === teamName) {
            goalsFor += match.score1 || 0;
            goalsAgainst += match.score2 || 0;

            if (match.score1 > match.score2) won++;
            else if (match.score1 === match.score2) drawn++;
            else lost++;
          } else {
            goalsFor += match.score2 || 0;
            goalsAgainst += match.score1 || 0;

            if (match.score2 > match.score1) won++;
            else if (match.score2 === match.score1) drawn++;
            else lost++;
          }
        }
      });

      const points = won * APP_CONSTANTS.TOURNAMENT.POINTS.WIN + drawn * APP_CONSTANTS.TOURNAMENT.POINTS.DRAW;
      const goalDifference = goalsFor - goalsAgainst;

      return {
        team: teamName,
        played,
        won,
        drawn,
        lost,
        goalsFor,
        goalsAgainst,
        goalDifference,
        points,
      };
    });

    // Sort by points (descending), then by goal difference (descending)
    this.teamStats.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.goalDifference - a.goalDifference;
    });
  }

  calculatePlayerStats() {
    const playerStatsMap = new Map<string, { name: string; team: string; goals: number; played: number }>();

    // Initialize all players
    this.teams.forEach(team => {
      team.players.forEach((player: TeamPlayerWithUser) => {
        playerStatsMap.set(player.userId, {
          name: player.name,
          team: team.name,
          goals: 0,
          played: 0
        });
      });
    });

    // Calculate player stats from matches
    this.matches.forEach(match => {
      if (match.status === APP_CONSTANTS.MATCH.STATUS.FINISHED) {
        // Team 1 players
        match.team1Players?.forEach((player: MatchPlayer) => {
          const stats = playerStatsMap.get(player.userId);
          if (stats) {
            stats.goals += player.score || 0;
            stats.played++;
          }
        });

        // Team 2 players
        match.team2Players?.forEach((player: MatchPlayer) => {
          const stats = playerStatsMap.get(player.userId);
          if (stats) {
            stats.goals += player.score || 0;
            stats.played++;
          }
        });
      }
    });

    // Convert to array and calculate averages
    this.playerStats = Array.from(playerStatsMap.values())
      .map(stats => ({
        ...stats,
        averageGoals: stats.played > 0 ? stats.goals / stats.played : 0
      }))
      .sort((a, b) => b.goals - a.goals); // Sort by goals descending
  }

  getMatchDate(timestamp: any): Date | null {
    if (!timestamp) return null;
    if (timestamp.toDate) return timestamp.toDate();
    if (timestamp instanceof Date) return timestamp;
    return new Date(timestamp);
  }
}
