import { Component, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton, IonIcon, IonBackButton, IonButtons, IonChip, LoadingController, ToastController, IonList, IonItemDivider } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { addIcons } from 'ionicons';
import { playOutline, stopOutline, trophyOutline, refreshOutline } from 'ionicons/icons';
import { FirestoreService } from '../services/firestore.service';
import { APP_CONSTANTS } from '../constants/app.constants';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-knockout',
  templateUrl: './knockout.page.html',

  imports: [IonItemDivider, IonList, CommonModule, TitleCasePipe, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton, IonIcon, IonBackButton, IonButtons, IonChip]
})
export class KnockoutPage implements OnDestroy {
  private route = inject(ActivatedRoute);
  private firestoreService = inject(FirestoreService);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  tournamentId = '';
  tournament: any = null;
  
  knockoutStages: any[] = APP_CONSTANTS.TOURNAMENT.STAGE_NAMES.map(name => ({ name, matches: [] }));

  teams: any[] = [];
  private matchesSubscription?: Subscription;

  constructor() {
    addIcons({ playOutline, stopOutline, trophyOutline, refreshOutline });
    this.tournamentId = this.route.snapshot.params['id'];
    this.getTournament();
    this.loadMatches();
  }

  async loadMatches() {
    if (this.tournamentId) {
      this.teams = await this.firestoreService.getTeamsWithPlayers(this.tournamentId);
      
      this.matchesSubscription = this.firestoreService.getMatchesWithTeamsLive(this.tournamentId).subscribe(matchesWithTeams => {
        this.organizeMatches(matchesWithTeams);
        this.cdr.detectChanges();
      });
    }
  }

  ngOnDestroy() {
    if (this.matchesSubscription) {
      this.matchesSubscription.unsubscribe();
    }
  }

  async getTournament() {
    const tournament = await this.firestoreService.getTournament(this.tournamentId);
    this.tournament = tournament;
  }

  get canEdit() {
    if (!this.tournament) return false;
    return this.authService.hasPermission('editor', this.tournament);
  }

  async generateMatches() {
    if (this.teams.length < APP_CONSTANTS.TOURNAMENT.MIN_TEAMS) {
      alert(APP_CONSTANTS.MESSAGES.VALIDATION.MIN_TEAMS);
      return;
    }

    const loading = await this.loadingController.create({ message: APP_CONSTANTS.MESSAGES.LOADING.GENERATING_MATCHES });
    await loading.present();

    try {
      for (let i = 0; i < this.teams.length; i++) {
        for (let j = i + 1; j < this.teams.length; j++) {
          await this.firestoreService.createMatch(this.tournamentId, {
            team1Id: this.teams[i].id!,
            team2Id: this.teams[j].id!,
            status: APP_CONSTANTS.MATCH.STATUS.PENDING,
            score1: 0,
            score2: 0,
            stage: APP_CONSTANTS.TOURNAMENT.STAGES.GROUP,
            startTime: null,
            endTime: null,
            duration: 0
          });
        }
      }
      
      const toast = await this.toastController.create({
        message: APP_CONSTANTS.MESSAGES.SUCCESS.MATCHES_GENERATED,
        duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
        color: APP_CONSTANTS.UI.COLORS.SUCCESS
      });
      await toast.present();
    } catch (error) {
      console.error('Error generating matches:', error);
      const toast = await this.toastController.create({
        message: APP_CONSTANTS.MESSAGES.ERROR.MATCHES_GENERATE,
        duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
        color: APP_CONSTANTS.UI.COLORS.DANGER
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }

  organizeMatches(matches: any[]) {
    this.knockoutStages[0].matches = matches.filter(m => m.stage === APP_CONSTANTS.TOURNAMENT.STAGES.GROUP || !m.stage);
    this.knockoutStages[1].matches = matches.filter(m => m.stage === APP_CONSTANTS.TOURNAMENT.STAGES.ROUND_16);
    this.knockoutStages[2].matches = matches.filter(m => m.stage === APP_CONSTANTS.TOURNAMENT.STAGES.QUARTER);
    this.knockoutStages[3].matches = matches.filter(m => m.stage === APP_CONSTANTS.TOURNAMENT.STAGES.SEMI);
    this.knockoutStages[4].matches = matches.filter(m => m.stage === APP_CONSTANTS.TOURNAMENT.STAGES.FINAL);
  }

  async advanceToNextRound() {
    const loading = await this.loadingController.create({ message: APP_CONSTANTS.MESSAGES.LOADING.ADVANCING_ROUND });
    await loading.present();
    
    try {
      const currentStageIndex = this.getCurrentStageIndex();
      const currentStage = this.knockoutStages[currentStageIndex];
      const nextStageIndex = currentStageIndex + 1;
      
      if (nextStageIndex >= this.knockoutStages.length) {
        alert(APP_CONSTANTS.MESSAGES.VALIDATION.TOURNAMENT_COMPLETE);
        return;
      }

      let qualifiedTeams: string[] = [];
      
      if (currentStageIndex === 0) {
        qualifiedTeams = this.getUniqueTeamIdsFromMatches(currentStage.matches);
      } else {
        qualifiedTeams = this.getWinnerIdsFromStage(currentStage.matches);
      }
      
      if (qualifiedTeams.length < 2) {
        alert(APP_CONSTANTS.MESSAGES.VALIDATION.MIN_TEAMS_ADVANCE.replace('{stage}', currentStage.name));
        return;
      }

      const nextStageTeams = this.getTeamsForStage(nextStageIndex, qualifiedTeams.length);
      const teamsToAdvance = qualifiedTeams.slice(0, nextStageTeams);
      
      const nextStage = this.knockoutStages[nextStageIndex];
      const nextStageKey = this.getStageKey(nextStageIndex);
      
      for (let i = 0; i < teamsToAdvance.length; i += 2) {
        if (i + 1 < teamsToAdvance.length) {
          await this.firestoreService.createMatch(this.tournamentId, {
            team1Id: teamsToAdvance[i],
            team2Id: teamsToAdvance[i + 1],
            status: APP_CONSTANTS.MATCH.STATUS.PENDING,
            score1: 0,
            score2: 0,
            stage: nextStageKey,
            startTime: null,
            endTime: null,
            duration: 0
          });
        }
      }
      
      const toast = await this.toastController.create({
        message: `${nextStage.name} created with ${Math.floor(teamsToAdvance.length / 2)} matches!`,
        duration: 3000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error advancing to next round:', error);
      const toast = await this.toastController.create({
        message: 'Error advancing to next round',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }

  getCurrentStageIndex(): number {
    for (let i = 0; i < this.knockoutStages.length - 1; i++) {
      const currentStageHasMatches = this.knockoutStages[i].matches.length > 0;
      const nextStageHasMatches = this.knockoutStages[i + 1].matches.length > 0;
      const allCurrentStageFinished = this.knockoutStages[i].matches.every((m: any) => m.status === APP_CONSTANTS.MATCH.STATUS.FINISHED);
      
      if (currentStageHasMatches && !nextStageHasMatches && allCurrentStageFinished) {
        return i;
      }
    }
    return 0;
  }

  getWinnersFromStage(matches: any[]): string[] {
    return matches
      .filter((match: any) => match.status === APP_CONSTANTS.MATCH.STATUS.FINISHED)
      .map((match: any) => {
        if (match.score1 > match.score2) return match.team1Name;
        if (match.score2 > match.score1) return match.team2Name;
        return match.team1Name;
      });
  }

  getWinnerIdsFromStage(matches: any[]): string[] {
    return matches
      .filter((match: any) => match.status === APP_CONSTANTS.MATCH.STATUS.FINISHED)
      .map((match: any) => {
        if (match.score1 > match.score2) return match.team1Id;
        if (match.score2 > match.score1) return match.team2Id;
        return match.team1Id;
      });
  }

  getStageKey(stageIndex: number): string {
    return APP_CONSTANTS.TOURNAMENT.STAGE_KEYS[stageIndex] || APP_CONSTANTS.TOURNAMENT.STAGES.GROUP;
  }

  getUniqueTeamsFromMatches(matches: any[]): string[] {
    const teams = new Set<string>();
    matches.forEach((match: any) => {
      teams.add(match.team1Name);
      teams.add(match.team2Name);
    });
    return Array.from(teams);
  }

  getUniqueTeamIdsFromMatches(matches: any[]): string[] {
    const teams = new Set<string>();
    matches.forEach((match: any) => {
      teams.add(match.team1Id);
      teams.add(match.team2Id);
    });
    return Array.from(teams);
  }

  getTeamsForStage(stageIndex: number, availableTeams: number): number {
    const capacity = (APP_CONSTANTS.TOURNAMENT.STAGE_CAPACITY as any)[stageIndex];
    return capacity ? Math.min(capacity, availableTeams) : availableTeams;
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
    const allFinished = currentStage.matches.every((m: any) => m.status === APP_CONSTANTS.MATCH.STATUS.FINISHED);
    const nextStageEmpty = this.knockoutStages[nextStageIndex].matches.length === 0;
    
    let hasEnoughTeams = false;
    if (currentStageIndex === 0) {
      hasEnoughTeams = this.getUniqueTeamIdsFromMatches(currentStage.matches).length >= 2;
    } else {
      hasEnoughTeams = this.getWinnerIdsFromStage(currentStage.matches).length >= 2;
    }
    
    return hasMatches && allFinished && nextStageEmpty && hasEnoughTeams;
  }

  getTournamentStatus(): string {
    const finalMatches = this.knockoutStages[4].matches;
    if (finalMatches.length > 0 && finalMatches.every((m: any) => m.status === APP_CONSTANTS.MATCH.STATUS.FINISHED)) {
      const winner = this.getWinnersFromStage(finalMatches)[0];
      return `Tournament Complete - Winner: ${winner}`;
    }
    
    for (let i = this.knockoutStages.length - 1; i >= 0; i--) {
      if (this.knockoutStages[i].matches.length > 0) {
        const allFinished = this.knockoutStages[i].matches.every((m: any) => m.status === APP_CONSTANTS.MATCH.STATUS.FINISHED);
        return `${this.knockoutStages[i].name} - ${allFinished ? 'Complete' : 'In Progress'}`;
      }
    }
    
    return 'Not Started';
  }
}
