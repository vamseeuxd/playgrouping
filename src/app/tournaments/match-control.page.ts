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
  IonButton,
  IonIcon,
  IonBackButton,
  IonButtons,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  playOutline,
  stopOutline,
  pauseOutline,
  addOutline,
  removeOutline,
} from 'ionicons/icons';
import {
  Firestore,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from '@angular/fire/firestore';

@Component({
  selector: 'app-match-control',
  templateUrl: './match-control.page.html',
  styleUrls: ['./match-control.page.scss'],
  imports: [
    CommonModule,
    TitleCasePipe,
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
    IonButton,
    IonIcon,
    IonBackButton,
    IonButtons,
    IonGrid,
    IonRow,
    IonCol
],
})
export class MatchControlPage {
  private route = inject(ActivatedRoute);
  private firestore = inject(Firestore);
  matchId = '';
  tournamentId = '';

  match = {
    id: '',
    team1: 'Team A',
    team2: 'Team B',
    score1: 0,
    score2: 0,
    status: 'pending', // pending, started, paused, finished
    startTime: null as Date | null,
    endTime: null as Date | null,
    duration: 0,
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
    });
    this.tournamentId = this.route.snapshot.queryParams['tournamentId'] || 'default';
    this.matchId = this.route.snapshot.params['id'];
    this.loadMatch();
  }

  async loadMatch() {
    try {
      const matchDoc = doc(this.firestore, `tournaments/${this.tournamentId}/matches`, this.matchId);
      const matchSnap = await getDoc(matchDoc);
      if (matchSnap.exists()) {
        this.match = { ...matchSnap.data(), id: this.matchId } as any;
        if (this.match.status === 'started') {
          this.startTimer();
        }
      }
    } catch (error) {
      console.error('Error loading match:', error);
    }
  }

  async startMatch() {
    this.match.status = 'started';
    this.match.startTime = new Date();
    this.startTimer();
    await this.updateMatchInFirestore();
  }

  async pauseMatch() {
    this.match.status = 'paused';
    this.stopTimer();
    await this.updateMatchInFirestore();
  }

  async stopMatch() {
    this.match.status = 'finished';
    this.match.endTime = new Date();
    this.match.duration = this.elapsedTime;
    this.stopTimer();
    await this.updateMatchInFirestore();
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
    if (team === 1) {
      this.match.score1 += increment ? 1 : -1;
      if (this.match.score1 < 0) this.match.score1 = 0;
    } else {
      this.match.score2 += increment ? 1 : -1;
      if (this.match.score2 < 0) this.match.score2 = 0;
    }
    await this.updateMatchInFirestore();
  }

  async updateMatchInFirestore() {
    try {
      const matchDoc = doc(this.firestore, `tournaments/${this.tournamentId}/matches`, this.matchId);
      const matchData = {
        id: this.matchId,
        team1: this.match.team1,
        team2: this.match.team2,
        status: this.match.status,
        score1: this.match.score1,
        score2: this.match.score2,
        startTime: this.match.startTime,
        endTime: this.match.endTime,
        duration: this.match.duration,
      };
      await setDoc(matchDoc, matchData, { merge: true });
    } catch (error) {
      console.error('Error updating match:', error);
    }
  }

  async resetMatch() {
    if (confirm('Are you sure you want to reset this match? All progress will be lost.')) {
      this.stopTimer();
      this.match.status = 'pending';
      this.match.score1 = 0;
      this.match.score2 = 0;
      this.match.startTime = null;
      this.match.endTime = null;
      this.match.duration = 0;
      this.elapsedTime = 0;
      await this.updateMatchInFirestore();
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
