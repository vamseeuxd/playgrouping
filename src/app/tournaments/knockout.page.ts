import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton, IonIcon, IonBackButton, IonButtons, IonChip } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { addIcons } from 'ionicons';
import { playOutline, stopOutline, trophyOutline, refreshOutline } from 'ionicons/icons';
import { Firestore, collection, collectionData, addDoc, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-knockout',
  templateUrl: './knockout.page.html',
  styleUrls: ['./knockout.page.scss'],
  imports: [CommonModule, TitleCasePipe, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton, IonIcon, IonBackButton, IonButtons, IonChip]
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
      const currentStageIndex = this.getCurrentStageIndex();
      const currentStage = this.knockoutStages[currentStageIndex];
      const nextStageIndex = currentStageIndex + 1;
      
      if (nextStageIndex >= this.knockoutStages.length) {
        alert('Tournament is already complete!');
        return;
      }

      let qualifiedTeams: string[] = [];
      
      if (currentStageIndex === 0) {
        // Group Stage: Get all teams that participated (for simplicity, all teams advance)
        // In real tournaments, you'd rank teams by points/wins
        qualifiedTeams = this.getUniqueTeamsFromMatches(currentStage.matches);
      } else {
        // Knockout rounds: Get winners only
        qualifiedTeams = this.getWinnersFromStage(currentStage.matches);
      }
      
      if (qualifiedTeams.length < 2) {
        alert(`Need at least 2 teams to advance from ${currentStage.name}`);
        return;
      }

      // Determine correct number of teams for next stage
      const nextStageTeams = this.getTeamsForStage(nextStageIndex, qualifiedTeams.length);
      const teamsToAdvance = qualifiedTeams.slice(0, nextStageTeams);
      
      // Create matches for next stage
      const nextStage = this.knockoutStages[nextStageIndex];
      const nextStageKey = this.getStageKey(nextStageIndex);
      const matchesCollection = collection(this.firestore, `tournaments/${this.tournamentId}/matches`);
      
      // Pair teams for next round matches
      for (let i = 0; i < teamsToAdvance.length; i += 2) {
        if (i + 1 < teamsToAdvance.length) {
          await addDoc(matchesCollection, {
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
    }
  }

  getCurrentStageIndex(): number {
    // Find the current active stage (has matches but next stage doesn't)
    for (let i = 0; i < this.knockoutStages.length - 1; i++) {
      const currentStageHasMatches = this.knockoutStages[i].matches.length > 0;
      const nextStageHasMatches = this.knockoutStages[i + 1].matches.length > 0;
      const allCurrentStageFinished = this.knockoutStages[i].matches.every((m: any) => m.status === 'finished');
      
      if (currentStageHasMatches && !nextStageHasMatches && allCurrentStageFinished) {
        return i;
      }
    }
    return 0; // Default to group stage
  }

  getWinnersFromStage(matches: any[]): string[] {
    return matches
      .filter((match: any) => match.status === 'finished')
      .map((match: any) => {
        if (match.score1 > match.score2) return match.team1;
        if (match.score2 > match.score1) return match.team2;
        // Handle draws - could implement tiebreaker logic here
        return match.team1; // Default to team1 for draws
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
    // Standard knockout tournament progression
    switch (stageIndex) {
      case 1: return Math.min(16, availableTeams); // Round of 16
      case 2: return Math.min(8, availableTeams);  // Quarter Finals
      case 3: return Math.min(4, availableTeams);  // Semi Finals
      case 4: return Math.min(2, availableTeams);  // Finals
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
    
    // Can't advance if we're at the final stage
    if (nextStageIndex >= this.knockoutStages.length) {
      return false;
    }
    
    // Can advance if current stage has matches, all are finished, and next stage has no matches
    const hasMatches = currentStage.matches.length > 0;
    const allFinished = currentStage.matches.every((m: any) => m.status === 'finished');
    const nextStageEmpty = this.knockoutStages[nextStageIndex].matches.length === 0;
    
    let hasEnoughTeams = false;
    if (currentStageIndex === 0) {
      // Group stage: need at least 2 teams total
      hasEnoughTeams = this.getUniqueTeamsFromMatches(currentStage.matches).length >= 2;
    } else {
      // Knockout rounds: need at least 2 winners
      hasEnoughTeams = this.getWinnersFromStage(currentStage.matches).length >= 2;
    }
    
    return hasMatches && allFinished && nextStageEmpty && hasEnoughTeams;
  }

  getTournamentStatus(): string {
    // Check if tournament is complete
    const finalMatches = this.knockoutStages[4].matches;
    if (finalMatches.length > 0 && finalMatches.every((m: any) => m.status === 'finished')) {
      const winner = this.getWinnersFromStage(finalMatches)[0];
      return `Tournament Complete - Winner: ${winner}`;
    }
    
    // Find current active stage
    for (let i = this.knockoutStages.length - 1; i >= 0; i--) {
      if (this.knockoutStages[i].matches.length > 0) {
        const allFinished = this.knockoutStages[i].matches.every((m: any) => m.status === 'finished');
        return `${this.knockoutStages[i].name} - ${allFinished ? 'Complete' : 'In Progress'}`;
      }
    }
    
    return 'Not Started';
  }
}