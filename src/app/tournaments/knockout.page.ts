import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton, IonIcon, IonBackButton, IonButtons, IonChip, LoadingController } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { addIcons } from 'ionicons';
import { playOutline, stopOutline, trophyOutline, refreshOutline } from 'ionicons/icons';
import { FirestoreService } from '../services/firestore.service';

@Component({
  selector: 'app-knockout',
  templateUrl: './knockout.page.html',
  styleUrls: ['./knockout.page.scss'],
  imports: [CommonModule, TitleCasePipe, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton, IonIcon, IonBackButton, IonButtons, IonChip]
})
export class KnockoutPage {
  private route = inject(ActivatedRoute);
  private firestoreService = inject(FirestoreService);
  private loadingController = inject(LoadingController);
  tournamentId = '';
  
  knockoutStages: any[] = [
    { name: 'Group Stage', matches: [] },
    { name: 'Round of 16', matches: [] },
    { name: 'Quarter Finals', matches: [] },
    { name: 'Semi Finals', matches: [] },
    { name: 'Finals', matches: [] }
  ];

  teams: any[] = [];

  constructor() {
    addIcons({ playOutline, stopOutline, trophyOutline, refreshOutline });
    this.tournamentId = this.route.snapshot.params['id'];
    this.loadMatches();
  }

  loadMatches() {
    if (this.tournamentId) {
      this.firestoreService.getTeams(this.tournamentId).subscribe(teams => {
        this.teams = teams;
      });
      
      this.firestoreService.getMatches(this.tournamentId).subscribe(matches => {
        this.organizeMatches(matches);
      });
    }
  }

  async generateMatches() {
    if (this.teams.length < 2) {
      alert('Need at least 2 teams to generate matches');
      return;
    }

    const loading = await this.loadingController.create({ message: 'Generating matches...' });
    await loading.present();

    try {
      for (let i = 0; i < this.teams.length; i++) {
        for (let j = i + 1; j < this.teams.length; j++) {
          await this.firestoreService.createMatch(this.tournamentId, {
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
    } finally {
      await loading.dismiss();
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
    const loading = await this.loadingController.create({ message: 'Advancing to next round...' });
    await loading.present();
    
    try {
      const currentStageIndex = this.getCurrentStageIndex();
      const currentStage = this.knockoutStages[currentStageIndex];
      const nextStageIndex = currentStageIndex + 1;
      
      if (nextStageIndex >= this.knockoutStages.length) {
        alert('Tournament is already complete!');
        return;
      }

      let qualifiedTeams: string[] = [];
      
      if (currentStageIndex === 0) {
        qualifiedTeams = this.getUniqueTeamsFromMatches(currentStage.matches);
      } else {
        qualifiedTeams = this.getWinnersFromStage(currentStage.matches);
      }
      
      if (qualifiedTeams.length < 2) {
        alert(`Need at least 2 teams to advance from ${currentStage.name}`);
        return;
      }

      const nextStageTeams = this.getTeamsForStage(nextStageIndex, qualifiedTeams.length);
      const teamsToAdvance = qualifiedTeams.slice(0, nextStageTeams);
      
      const nextStage = this.knockoutStages[nextStageIndex];
      const nextStageKey = this.getStageKey(nextStageIndex);
      
      for (let i = 0; i < teamsToAdvance.length; i += 2) {
        if (i + 1 < teamsToAdvance.length) {
          await this.firestoreService.createMatch(this.tournamentId, {
            team1: teamsToAdvance[i],
            team2: teamsToAdvance[i + 1],
            status: 'pending',
            score1: 0,
            score2: 0,
            stage: nextStageKey,
            startTime: null,
            endTime: null,
            duration: 0
          });
        }
      }
      
      alert(`${nextStage.name} created with ${Math.floor(teamsToAdvance.length / 2)} matches!`);
    } catch (error) {
      console.error('Error advancing to next round:', error);
    } finally {
      await loading.dismiss();
    }
  }

  getCurrentStageIndex(): number {
    for (let i = 0; i < this.knockoutStages.length - 1; i++) {
      const currentStageHasMatches = this.knockoutStages[i].matches.length > 0;
      const nextStageHasMatches = this.knockoutStages[i + 1].matches.length > 0;
      const allCurrentStageFinished = this.knockoutStages[i].matches.every((m: any) => m.status === 'finished');
      
      if (currentStageHasMatches && !nextStageHasMatches && allCurrentStageFinished) {
        return i;
      }
    }
    return 0;
  }

  getWinnersFromStage(matches: any[]): string[] {
    return matches
      .filter((match: any) => match.status === 'finished')
      .map((match: any) => {
        if (match.score1 > match.score2) return match.team1;
        if (match.score2 > match.score1) return match.team2;
        return match.team1;
      });
  }

  getStageKey(stageIndex: number): string {
    const stageKeys = ['group', 'round16', 'quarter', 'semi', 'final'];
    return stageKeys[stageIndex] || 'group';
  }

  getUniqueTeamsFromMatches(matches: any[]): string[] {
    const teams = new Set<string>();
    matches.forEach((match: any) => {
      teams.add(match.team1);
      teams.add(match.team2);
    });
    return Array.from(teams);
  }

  getTeamsForStage(stageIndex: number, availableTeams: number): number {
    switch (stageIndex) {
      case 1: return Math.min(16, availableTeams);
      case 2: return Math.min(8, availableTeams);
      case 3: return Math.min(4, availableTeams);
      case 4: return Math.min(2, availableTeams);
      default: return availableTeams;
    }
  }

  getStageStatus(matches: any[]): string {
    if (matches.length === 0) return 'Not Started';
    if (matches.every((m: any) => m.status === 'finished')) return 'Complete';
    if (matches.some((m: any) => m.status === 'started' || m.status === 'paused')) return 'In Progress';
    return 'Pending';
  }

  canAdvanceToNextRound(): boolean {
    const currentStageIndex = this.getCurrentStageIndex();
    const currentStage = this.knockoutStages[currentStageIndex];
    const nextStageIndex = currentStageIndex + 1;
    
    if (nextStageIndex >= this.knockoutStages.length) {
      return false;
    }
    
    const hasMatches = currentStage.matches.length > 0;
    const allFinished = currentStage.matches.every((m: any) => m.status === 'finished');
    const nextStageEmpty = this.knockoutStages[nextStageIndex].matches.length === 0;
    
    let hasEnoughTeams = false;
    if (currentStageIndex === 0) {
      hasEnoughTeams = this.getUniqueTeamsFromMatches(currentStage.matches).length >= 2;
    } else {
      hasEnoughTeams = this.getWinnersFromStage(currentStage.matches).length >= 2;
    }
    
    return hasMatches && allFinished && nextStageEmpty && hasEnoughTeams;
  }

  getTournamentStatus(): string {
    const finalMatches = this.knockoutStages[4].matches;
    if (finalMatches.length > 0 && finalMatches.every((m: any) => m.status === 'finished')) {
      const winner = this.getWinnersFromStage(finalMatches)[0];
      return `Tournament Complete - Winner: ${winner}`;
    }
    
    for (let i = this.knockoutStages.length - 1; i >= 0; i--) {
      if (this.knockoutStages[i].matches.length > 0) {
        const allFinished = this.knockoutStages[i].matches.every((m: any) => m.status === 'finished');
        return `${this.knockoutStages[i].name} - ${allFinished ? 'Complete' : 'In Progress'}`;
      }
    }
    
    return 'Not Started';
  }
}