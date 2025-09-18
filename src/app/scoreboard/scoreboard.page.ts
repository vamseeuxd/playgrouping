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
import { Firestore, collection, collectionData } from '@angular/fire/firestore';

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
  ],
})
export class ScoreboardPage {
  private route = inject(ActivatedRoute);
  private firestore = inject(Firestore);
  tournamentId = '';

  teams: any[] = [];
  matches: any[] = [];
  teamStats: any[] = [];

  constructor() {
    this.tournamentId = this.route.snapshot.params['id'];
    this.loadData();
  }

  loadData() {
    if (this.tournamentId) {
      // Load teams
      const teamsCollection = collection(
        this.firestore,
        `tournaments/${this.tournamentId}/teams`
      );
      collectionData(teamsCollection, { idField: 'id' }).subscribe((teams) => {
        this.teams = teams;
        this.calculateStats();
      });

      // Load matches
      const matchesCollection = collection(
        this.firestore,
        `tournaments/${this.tournamentId}/matches`
      );
      collectionData(matchesCollection, { idField: 'id' }).subscribe(
        (matches) => {
          this.matches = matches;
          this.calculateStats();
        }
      );
    }
  }

  calculateStats() {
    if (this.teams.length === 0 || this.matches.length === 0) return;

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
          match.status === 'finished' &&
          (match.team1 === teamName || match.team2 === teamName)
        ) {
          played++;

          if (match.team1 === teamName) {
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

      const points = won * 3 + drawn * 1; // 3 points for win, 1 for draw
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

  getMatchDate(timestamp: any): Date | null {
    if (!timestamp) return null;
    if (timestamp.toDate) return timestamp.toDate();
    if (timestamp instanceof Date) return timestamp;
    return new Date(timestamp);
  }
}
