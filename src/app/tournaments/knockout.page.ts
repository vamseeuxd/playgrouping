import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton, IonIcon, IonBackButton, IonButtons } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { addIcons } from 'ionicons';
import { playOutline, stopOutline, trophyOutline, refreshOutline } from 'ionicons/icons';
import { Firestore, collection, collectionData, addDoc, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-knockout',
  templateUrl: './knockout.page.html',
  styleUrls: ['./knockout.page.scss'],
  imports: [CommonModule, TitleCasePipe, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton, IonIcon, IonBackButton, IonButtons]
})
export class KnockoutPage {
  private route = inject(ActivatedRoute);
  private firestore = inject(Firestore);
  tournamentId = '';
  
  knockoutStages: any[] = [
    { name: 'Group Stage', matches: [] },
    { name: 'Round of 16', matches: [] },
    { name: 'Quarter Finals', matches: [] },
    { name: 'Semi Finals', matches: [] },
    { name: 'Finals', matches: [] }
  ];

  constructor() {
    addIcons({ playOutline, stopOutline, trophyOutline, refreshOutline });
    this.tournamentId = this.route.snapshot.params['id'];
    this.loadMatches();
  }

  teams: any[] = [];

  loadMatches() {
    if (this.tournamentId) {
      // Load teams
      const teamsCollection = collection(this.firestore, `tournaments/${this.tournamentId}/teams`);
      collectionData(teamsCollection, { idField: 'id' }).subscribe(teams => {
        this.teams = teams;
      });
      
      // Load matches
      const matchesCollection = collection(this.firestore, `tournaments/${this.tournamentId}/matches`);
      collectionData(matchesCollection, { idField: 'id' }).subscribe(matches => {
        this.organizeMatches(matches);
      });
    }
  }

  async generateMatches() {
    if (this.teams.length < 2) {
      alert('Need at least 2 teams to generate matches');
      return;
    }

    try {
      const matchesCollection = collection(this.firestore, `tournaments/${this.tournamentId}/matches`);
      
      // Generate round-robin matches
      for (let i = 0; i < this.teams.length; i++) {
        for (let j = i + 1; j < this.teams.length; j++) {
          await addDoc(matchesCollection, {
            team1: this.teams[i].name,
            team2: this.teams[j].name,
            status: 'pending',
            score1: 0,
            score2: 0,
            stage: 'group',
            startTime: null,
            endTime: null,
            duration: 0
          });
        }
      }
      
      alert('Matches generated successfully!');
    } catch (error) {
      console.error('Error generating matches:', error);
    }
  }

  organizeMatches(matches: any[]) {
    this.knockoutStages[0].matches = matches.filter(m => m.stage === 'group' || !m.stage);
    this.knockoutStages[1].matches = matches.filter(m => m.stage === 'round16');
    this.knockoutStages[2].matches = matches.filter(m => m.stage === 'quarter');
    this.knockoutStages[3].matches = matches.filter(m => m.stage === 'semi');
    this.knockoutStages[4].matches = matches.filter(m => m.stage === 'final');
  }

  async advanceToNextRound() {
    try {
      const groupMatches = this.knockoutStages[0].matches.filter((m: any) => m.status === 'finished');
      
      if (groupMatches.length === 0) {
        alert('No completed group matches to advance from');
        return;
      }

      // Get winners from group stage
      const winners = groupMatches.map((match: any) => {
        return match.score1 > match.score2 ? match.team1 : match.team2;
      });

      if (winners.length < 2) {
        alert('Need at least 2 winners to create next round');
        return;
      }

      // Determine next stage
      let nextStage = '';
      let stageIndex = 1;
      
      if (winners.length >= 16) {
        nextStage = 'round16';
        stageIndex = 1;
      } else if (winners.length >= 8) {
        nextStage = 'quarter';
        stageIndex = 2;
      } else if (winners.length >= 4) {
        nextStage = 'semi';
        stageIndex = 3;
      } else {
        nextStage = 'final';
        stageIndex = 4;
      }

      // Create matches for next round
      const matchesCollection = collection(this.firestore, `tournaments/${this.tournamentId}/matches`);
      
      for (let i = 0; i < winners.length; i += 2) {
        if (i + 1 < winners.length) {
          await addDoc(matchesCollection, {
            team1: winners[i],
            team2: winners[i + 1],
            status: 'pending',
            score1: 0,
            score2: 0,
            stage: nextStage,
            startTime: null,
            endTime: null,
            duration: 0
          });
        }
      }
      
      alert(`${this.knockoutStages[stageIndex].name} matches created!`);
    } catch (error) {
      console.error('Error advancing to next round:', error);
    }
  }

  canAdvanceToNextRound(): boolean {
    const groupFinished = this.knockoutStages[0].matches.every((m: any) => m.status === 'finished');
    const round16Finished = this.knockoutStages[1].matches.length === 0 || this.knockoutStages[1].matches.every((m: any) => m.status === 'finished');
    const quarterFinished = this.knockoutStages[2].matches.length === 0 || this.knockoutStages[2].matches.every((m: any) => m.status === 'finished');
    const semiFinished = this.knockoutStages[3].matches.length === 0 || this.knockoutStages[3].matches.every((m: any) => m.status === 'finished');
    
    return (groupFinished && this.knockoutStages[1].matches.length === 0) ||
           (round16Finished && this.knockoutStages[2].matches.length === 0) ||
           (quarterFinished && this.knockoutStages[3].matches.length === 0) ||
           (semiFinished && this.knockoutStages[4].matches.length === 0);
  }
}