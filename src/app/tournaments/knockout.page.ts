import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton, IonIcon, IonBackButton, IonButtons } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { addIcons } from 'ionicons';
import { playOutline, stopOutline, trophyOutline } from 'ionicons/icons';
import { Firestore, collection, collectionData, addDoc } from '@angular/fire/firestore';

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
    addIcons({ playOutline, stopOutline, trophyOutline });
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
        this.knockoutStages[0].matches = matches;
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
}