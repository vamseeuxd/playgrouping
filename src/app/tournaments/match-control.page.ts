import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
  LoadingController,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { MatchControlsComponent } from '../components/match/match-controls.component';
import { ScoreBoardComponent } from '../components/match/score-board.component';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  playOutline,
  stopOutline,
  pauseOutline,
  addOutline,
  removeOutline,
  qrCodeOutline,
} from 'ionicons/icons';
import { FirestoreService } from '../services/firestore.service';
import { APP_CONSTANTS } from '../constants/app.constants';
import { AuthService } from '../services/auth.service';
import { Match, TournamentWithId, Team, TeamPlayerWithUser } from '../interfaces';

@Component({
  selector: 'app-match-control',
  templateUrl: './match-control.page.html',
  styleUrls: ['./match-control.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
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
    MatchControlsComponent,
    ScoreBoardComponent
],
})
export class MatchControlPage {
  private route = inject(ActivatedRoute);
  private firestoreService = inject(FirestoreService);
  private loadingController = inject(LoadingController);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  matchId = '';
  tournamentId = '';
  tournament: TournamentWithId | null = null;
  private authService = inject(AuthService);
  teams: (Team & { players: TeamPlayerWithUser[] })[] = [];

  match: Match = {
    id: '',
    team1: 'Team A',
    team2: 'Team B',
    score1: 0,
    score2: 0,
    status: APP_CONSTANTS.MATCH.STATUS.PENDING,
    stage: APP_CONSTANTS.TOURNAMENT.STAGES.GROUP,
    startTime: null,
    endTime: null,
    duration: 0,
    team1Players: [],
    team2Players: [],
  };

  timer: any;
  elapsedTime = 0;

  constructor() {
    addIcons({
      playOutline,
      stopOutline,
      pauseOutline,
      addOutline,
      removeOutline,
      qrCodeOutline,
    });
    this.tournamentId = this.route.snapshot.queryParams['tournamentId'] || 'default';
    console.log('tournamentId:', this.route.snapshot.params);
    
    this.matchId = this.route.snapshot.params['id'];
    this.getTournament();
    this.loadTeams();
    this.loadMatch();
    this.firestoreService.getLiveMatchData(this.tournamentId, this.matchId).subscribe((data) => {
      if (data) {
        this.match = data;
        console.log('Match data loaded:', this.match);
        this.initializePlayerScores();
      }
    });
  } 

  async getTournament() {
    const tournament = await this.firestoreService.getTournament(this.tournamentId);
    this.tournament = tournament;
  }

  async loadTeams() {
    this.teams = await this.firestoreService.getTeamsWithPlayers(this.tournamentId);
    this.initializePlayerScores();
  }

  initializePlayerScores() {
    if (this.teams.length === 0 || !this.match.team1 || !this.match.team2) return;
    
    const team1 = this.teams.find(t => t.name === this.match.team1);
    const team2 = this.teams.find(t => t.name === this.match.team2);
    
    if (team1 && (!this.match.team1Players || this.match.team1Players.length === 0)) {
      this.match.team1Players = team1.players.map((p: TeamPlayerWithUser) => ({ 
        id: p.id,
        userId: p.userId, 
        name: p.name,
        email: p.email,
        photoURL: p.photoURL,
        score: p.score || 0 
      }));
    }
    if (team2 && (!this.match.team2Players || this.match.team2Players.length === 0)) {
      this.match.team2Players = team2.players.map((p: TeamPlayerWithUser) => ({ 
        id: p.id,
        userId: p.userId, 
        name: p.name,
        email: p.email,
        photoURL: p.photoURL,
        score: p.score || 0 
      }));
    }
    
    console.log('Initialized players:', {
      team1Players: this.match.team1Players,
      team2Players: this.match.team2Players
    });
  }

  get canEdit() {
    if (!this.tournament) return false;
    return this.authService.hasPermission('editor', this.tournament);
  }

  async loadMatch() {
    const loading = await this.loadingController.create({ message: 'Loading match...' });
    await loading.present();
    
    try {
      const match = await this.firestoreService.getMatch(this.tournamentId, this.matchId);
      if (match) {
        this.match = match;
        console.log('Initial match load:', this.match);
        this.initializePlayerScores();
        if (this.match.status === APP_CONSTANTS.MATCH.STATUS.STARTED) {
          this.startTimer();
        }
      }
    } catch (error) {
      console.error('Error loading match:', error);
    } finally {
      await loading.dismiss();
    }
  }

  async startMatch() {
    const loading = await this.loadingController.create({ message: 'Starting match...' });
    await loading.present();
    
    try {
      this.match.status = APP_CONSTANTS.MATCH.STATUS.STARTED;
      this.match.startTime = new Date();
      this.startTimer();
      await this.updateMatchInFirestore();
    } finally {
      await loading.dismiss();
    }
  }

  async pauseMatch() {
    const loading = await this.loadingController.create({ message: 'Pausing match...' });
    await loading.present();
    
    try {
      this.match.status = APP_CONSTANTS.MATCH.STATUS.PAUSED;
      this.stopTimer();
      await this.updateMatchInFirestore();
      const toast = await this.toastController.create({
        message: 'Match paused successfully!',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Error pausing match',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }

  async stopMatch() {
    const loading = await this.loadingController.create({ message: 'Ending match...' });
    await loading.present();
    
    try {
      this.match.status = APP_CONSTANTS.MATCH.STATUS.FINISHED;
      this.match.endTime = new Date();
      this.match.duration = this.elapsedTime;
      this.stopTimer();
      await this.updateMatchInFirestore();
      const toast = await this.toastController.create({
        message: 'Match ended successfully!',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Error ending match',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.elapsedTime++;
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  async updateScore(team: number, increment: boolean) {
    const loading = await this.loadingController.create({ message: 'Updating score...' });
    await loading.present();
    
    try {
      if (team === 1) {
        this.match.score1 += increment ? 1 : -1;
        if (this.match.score1 < 0) this.match.score1 = 0;
      } else {
        this.match.score2 += increment ? 1 : -1;
        if (this.match.score2 < 0) this.match.score2 = 0;
      }
      await this.updateMatchInFirestore();
    } finally {
      await loading.dismiss();
    }
  }

  async updatePlayerScore(team: number, playerId: string, increment: boolean) {
    const loading = await this.loadingController.create({ message: 'Updating player score...' });
    await loading.present();
    
    try {
      const players = team === 1 ? this.match.team1Players : this.match.team2Players;
      const player = players?.find(p => p.userId === playerId);
      
      if (player) {
        player.score = (player.score || 0) + (increment ? 1 : -1);
        if (player.score < 0) player.score = 0;
        
        // Update team total score
        const teamScore = players?.reduce((sum, p) => sum + (p.score || 0), 0) || 0;
        if (team === 1) {
          this.match.score1 = teamScore;
        } else {
          this.match.score2 = teamScore;
        }
        
        await this.updateMatchInFirestore();
      }
    } finally {
      await loading.dismiss();
    }
  }

  async updateMatchInFirestore() {
    const matchData: Partial<Match> = {
      id: this.matchId,
      team1: this.match.team1,
      team2: this.match.team2,
      status: this.match.status,
      score1: this.match.score1,
      score2: this.match.score2,
      startTime: this.match.startTime,
      endTime: this.match.endTime,
      duration: this.match.duration,
      team1Players: this.match.team1Players || [],
      team2Players: this.match.team2Players || [],
    };
    await this.firestoreService.updateMatch(this.tournamentId, this.matchId, matchData);
  }

  async resetMatch() {
    const alert = await this.alertController.create({
      header: 'Reset Match',
      message: 'Are you sure you want to reset this match? All progress will be lost.',
      buttons: [
        { text: 'No', role: 'cancel' },
        { text: 'Yes', handler: () => this.performResetMatch() }
      ]
    });
    await alert.present();
  }

  async performResetMatch() {
      const loading = await this.loadingController.create({ message: 'Resetting match...' });
      await loading.present();
      
      try {
        this.stopTimer();
        this.match.status = APP_CONSTANTS.MATCH.STATUS.PENDING;
        this.match.score1 = 0;
        this.match.score2 = 0;
        this.match.startTime = null;
        this.match.endTime = null;
        this.match.duration = 0;
        this.elapsedTime = 0;
        
        // Reset player scores
        this.match.team1Players?.forEach(player => player.score = 0);
        this.match.team2Players?.forEach(player => player.score = 0);
        
        await this.updateMatchInFirestore();
        
        const toast = await this.toastController.create({
          message: 'Match reset successfully!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
      } catch (error) {
        console.error('Error resetting match:', error);
        const toast = await this.toastController.create({
          message: 'Error resetting match',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      } finally {
        await loading.dismiss();
      }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }
}
