/**
 * Knockout Tournament Page Component
 * 
 * Manages knockout tournament functionality including:
 * - Tournament stage visualization
 * - Match generation for group stage
 * - Round advancement logic
 * - Real-time match updates
 * - Stage status tracking
 * 
 * @author PlayGrouping Team
 * @version 1.0.0
 */

import { Component, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton, IonIcon, 
  IonBackButton, IonButtons, IonChip, LoadingController, ToastController, 
  IonList, IonItemDivider 
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

// Services
import { FirestoreService } from '../services/firestore.service';
import { AuthService } from '../services/auth.service';

// Constants
import { APP_CONSTANTS } from '../constants/app.constants';
import { KNOCKOUT_CONSTANTS } from '../constants/knockout.constants';

// Interfaces
import { TournamentWithId, MatchWithTeams } from '../interfaces';

// Icons
import { addIcons } from 'ionicons';
import { playOutline, stopOutline, trophyOutline, refreshOutline } from 'ionicons/icons';

@Component({
  selector: 'app-knockout',
  templateUrl: './knockout.page.html',
  imports: [
    // Angular Common
    CommonModule, 
    RouterLink,
    
    // Ionic Components
    IonList, 
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
    IonChip
  ]
})
export class KnockoutPage implements OnDestroy {
  // ========================================
  // DEPENDENCY INJECTION
  // ========================================
  
  /** Route service for accessing route parameters */
  private readonly route = inject(ActivatedRoute);
  
  /** Firestore service for database operations */
  private readonly firestoreService = inject(FirestoreService);
  
  /** Loading controller for showing loading indicators */
  private readonly loadingController = inject(LoadingController);
  
  /** Toast controller for showing toast messages */
  private readonly toastController = inject(ToastController);
  
  /** Authentication service for user permissions */
  private readonly authService = inject(AuthService);
  
  /** Change detector for manual change detection */
  private readonly cdr = inject(ChangeDetectorRef);

  // ========================================
  // CONSTANTS EXPOSED TO TEMPLATE
  // ========================================
  
  /** Knockout-specific constants */
  readonly CONSTANTS = KNOCKOUT_CONSTANTS;
  
  /** App constants */
  readonly APP_CONSTANTS = APP_CONSTANTS;
  
  /** Route constants */
  readonly ROUTES = {
    TOURNAMENTS: '/tournaments',
    MATCH_CONTROL: '/match-control',
  };

  // ========================================
  // COMPONENT STATE
  // ========================================
  
  /** Current tournament ID */
  tournamentId = '';
  
  /** Tournament data */
  tournament: TournamentWithId | null = null;
  
  /** Knockout stages with matches */
  knockoutStages: { name: string; matches: MatchWithTeams[] }[] = 
    APP_CONSTANTS.TOURNAMENT.STAGE_NAMES.map(name => ({ name, matches: [] }));

  /** Teams list with player data */
  teams: any[] = [];
  
  /** Subscription for real-time match updates */
  private matchesSubscription?: Subscription;

  // ========================================
  // CONSTRUCTOR
  // ========================================
  
  constructor() {
    // Register required icons
    this.registerIcons();
    
    // Extract tournament ID from route
    this.tournamentId = this.route.snapshot.params['id'];
    
    // Load initial data
    this.initializeComponent();
  }
  
  /**
   * Registers all ionicons used in this component
   */
  private registerIcons(): void {
    addIcons({ playOutline, stopOutline, trophyOutline, refreshOutline });
  }
  
  /**
   * Initializes component by loading tournament and match data
   */
  private async initializeComponent(): Promise<void> {
    await this.getTournament();
    this.loadMatches();
  }

  // ========================================
  // LIFECYCLE HOOKS
  // ========================================
  
  /**
   * Component cleanup
   * Unsubscribes from match updates to prevent memory leaks
   */
  ngOnDestroy(): void {
    if (this.matchesSubscription) {
      this.matchesSubscription.unsubscribe();
    }
  }

  // ========================================
  // DATA LOADING METHODS
  // ========================================
  
  /**
   * Loads matches and subscribes to real-time updates
   */
  private async loadMatches(): Promise<void> {
    if (!this.tournamentId) return;
    
    try {
      // Load teams data
      this.teams = await this.firestoreService.getTeamsWithPlayers(this.tournamentId);
      
      // Subscribe to live match updates
      this.matchesSubscription = this.firestoreService
        .getMatchesWithTeamsLive(this.tournamentId)
        .subscribe(matchesWithTeams => {
          this.organizeMatches(matchesWithTeams);
          this.cdr.detectChanges(); // Force change detection for real-time updates
        });
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  }

  /**
   * Loads tournament data from Firestore
   */
  private async getTournament(): Promise<void> {
    try {
      this.tournament = await this.firestoreService.getTournament(this.tournamentId);
    } catch (error) {
      console.error('Error loading tournament:', error);
    }
  }

  // ========================================
  // COMPUTED PROPERTIES
  // ========================================
  
  /**
   * Determines if the current user can edit the tournament
   */
  get canEdit(): boolean {
    if (!this.tournament) return false;
    return this.authService.hasPermission('editor', this.tournament);
  }

  // ========================================
  // TEMPLATE HELPER METHODS
  // ========================================
  
  /**
   * Gets total count of matches across all stages
   */
  getTotalMatchesCount(): number {
    return this.knockoutStages.reduce((total, stage) => total + stage.matches.length, 0);
  }
  
  /**
   * Checks if matches can be generated
   */
  canGenerateMatches(): boolean {
    return this.teams.length >= KNOCKOUT_CONSTANTS.REQUIREMENTS.MIN_TEAMS_FOR_MATCHES && 
           this.knockoutStages[0].matches.length === 0 && 
           this.canEdit;
  }
  
  /**
   * Gets advance button text
   */
  getAdvanceButtonText(): string {
    const nextStageIndex = this.getCurrentStageIndex() + 1;
    const nextStageName = this.knockoutStages[nextStageIndex]?.name || '';
    return `${KNOCKOUT_CONSTANTS.LABELS.ADVANCE_TO} ${nextStageName}`;
  }
  
  /**
   * Checks if a stage has matches
   */
  hasStageMatches(stage: { matches: MatchWithTeams[] }): boolean {
    return stage.matches.length > 0;
  }
  
  /**
   * Gets stage status color based on match completion
   */
  getStageStatusColor(matches: MatchWithTeams[]): string {
    const status = this.getStageStatus(matches);
    switch (status) {
      case KNOCKOUT_CONSTANTS.STATUS.COMPLETE:
        return KNOCKOUT_CONSTANTS.COLORS.SUCCESS;
      case KNOCKOUT_CONSTANTS.STATUS.IN_PROGRESS:
        return KNOCKOUT_CONSTANTS.COLORS.WARNING;
      default:
        return KNOCKOUT_CONSTANTS.COLORS.MEDIUM;
    }
  }
  
  /**
   * Gets match control route for navigation
   */
  getMatchControlRoute(matchId: string): string[] {
    return [this.ROUTES.MATCH_CONTROL, matchId];
  }
  
  /**
   * Gets query parameters for match navigation
   */
  getMatchQueryParams(): { tournamentId: string } {
    return { tournamentId: this.tournamentId };
  }
  
  /**
   * Gets match title display text
   */
  getMatchTitle(match: MatchWithTeams): string {
    return `${match.team1Name} vs ${match.team2Name}`;
  }
  
  /**
   * Checks if match is finished
   */
  isMatchFinished(match: MatchWithTeams): boolean {
    return match.status === KNOCKOUT_CONSTANTS.STATUS.FINISHED;
  }
  
  /**
   * Checks if match is in progress
   */
  isMatchInProgress(match: MatchWithTeams): boolean {
    return !!match.status && match.status !== KNOCKOUT_CONSTANTS.STATUS.PENDING;
  }
  
  /**
   * Gets final score text for finished matches
   */
  getFinalScoreText(match: MatchWithTeams): string {
    return `${KNOCKOUT_CONSTANTS.LABELS.FINAL_SCORE}: ${match.score1} - ${match.score2}`;
  }
  
  /**
   * Gets winner text for finished matches
   */
  getWinnerText(match: MatchWithTeams): string {
    let winner: string;
    if (match.score1 > match.score2) {
      winner = match.team1Name;
    } else if (match.score2 > match.score1) {
      winner = match.team2Name;
    } else {
      winner = KNOCKOUT_CONSTANTS.LABELS.DRAW;
    }
    return `${KNOCKOUT_CONSTANTS.LABELS.WINNER}: ${winner}`;
  }
  
  /**
   * Gets in-progress status text
   */
  getInProgressStatusText(match: MatchWithTeams): string {
    const status = match.status ? match.status.charAt(0).toUpperCase() + match.status.slice(1) : '';
    const score1 = match.score1 || 0;
    const score2 = match.score2 || 0;
    return `${KNOCKOUT_CONSTANTS.LABELS.STATUS}: ${status} | Score: ${score1} - ${score2}`;
  }
  
  /**
   * Gets pending status text
   */
  getPendingStatusText(): string {
    return `${KNOCKOUT_CONSTANTS.LABELS.STATUS}: ${KNOCKOUT_CONSTANTS.LABELS.PENDING}`;
  }

  // ========================================
  // MATCH ORGANIZATION METHODS
  // ========================================
  
  /**
   * Organizes matches into appropriate tournament stages
   */
  private organizeMatches(matches: MatchWithTeams[]): void {
    this.knockoutStages[0].matches = matches.filter(m => 
      m.stage === APP_CONSTANTS.TOURNAMENT.STAGES.GROUP || !m.stage
    );
    this.knockoutStages[1].matches = matches.filter(m => 
      m.stage === APP_CONSTANTS.TOURNAMENT.STAGES.ROUND_16
    );
    this.knockoutStages[2].matches = matches.filter(m => 
      m.stage === APP_CONSTANTS.TOURNAMENT.STAGES.QUARTER
    );
    this.knockoutStages[3].matches = matches.filter(m => 
      m.stage === APP_CONSTANTS.TOURNAMENT.STAGES.SEMI
    );
    this.knockoutStages[4].matches = matches.filter(m => 
      m.stage === APP_CONSTANTS.TOURNAMENT.STAGES.FINAL
    );
  }

  // ========================================
  // TOURNAMENT MANAGEMENT METHODS
  // ========================================
  
  /**
   * Generates group stage matches for all teams
   * Creates round-robin matches between all teams
   */
  async generateMatches(): Promise<void> {
    // Validate minimum teams requirement
    if (this.teams.length < APP_CONSTANTS.TOURNAMENT.MIN_TEAMS) {
      alert(APP_CONSTANTS.MESSAGES.VALIDATION.MIN_TEAMS);
      return;
    }

    const loading = await this.loadingController.create({ 
      message: APP_CONSTANTS.MESSAGES.LOADING.GENERATING_MATCHES 
    });
    await loading.present();

    try {
      // Generate round-robin matches
      for (let i = 0; i < this.teams.length; i++) {
        for (let j = i + 1; j < this.teams.length; j++) {
          await this.createGroupStageMatch(this.teams[i], this.teams[j]);
        }
      }
      
      await this.showSuccessToast(APP_CONSTANTS.MESSAGES.SUCCESS.MATCHES_GENERATED);
    } catch (error) {
      console.error('Error generating matches:', error);
      await this.showErrorToast(APP_CONSTANTS.MESSAGES.ERROR.MATCHES_GENERATE);
    } finally {
      await loading.dismiss();
    }
  }
  
  /**
   * Creates a single group stage match between two teams
   */
  private async createGroupStageMatch(team1: any, team2: any): Promise<void> {
    await this.firestoreService.createMatch(this.tournamentId, {
      team1Id: team1.id!,
      team2Id: team2.id!,
      status: APP_CONSTANTS.MATCH.STATUS.PENDING,
      score1: 0,
      score2: 0,
      stage: APP_CONSTANTS.TOURNAMENT.STAGES.GROUP,
      startTime: null,
      endTime: null,
      duration: 0
    });
  }

  /**
   * Gets unique team IDs from a list of matches
   */
  private getUniqueTeamIdsFromMatches(matches: MatchWithTeams[]): string[] {
    const teams = new Set<string>();
    matches.forEach((match) => {
      teams.add(match.team1Id);
      teams.add(match.team2Id);
    });
    return Array.from(teams);
  }
  
  // ========================================
  // UTILITY METHODS
  // ========================================
  
  /**
   * Shows a success toast message
   */
  private async showSuccessToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
      color: APP_CONSTANTS.UI.COLORS.SUCCESS
    });
    await toast.present();
  }
  
  /**
   * Shows an error toast message
   */
  private async showErrorToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
      color: APP_CONSTANTS.UI.COLORS.DANGER
    });
    await toast.present();
  }
  
  /**
   * Gets tournament status for display
   */
  getTournamentStatus(): string {
    // Implementation depends on tournament status logic
    return 'Active'; // Placeholder
  }
  
  /**
   * Gets stage status based on match completion
   */
  getStageStatus(matches: MatchWithTeams[]): string {
    if (matches.length === 0) return KNOCKOUT_CONSTANTS.STATUS.PENDING;
    
    const finishedMatches = matches.filter(m => 
      m.status === KNOCKOUT_CONSTANTS.STATUS.FINISHED
    ).length;
    
    if (finishedMatches === matches.length) {
      return KNOCKOUT_CONSTANTS.STATUS.COMPLETE;
    } else if (finishedMatches > 0) {
      return KNOCKOUT_CONSTANTS.STATUS.IN_PROGRESS;
    } else {
      return KNOCKOUT_CONSTANTS.STATUS.PENDING;
    }
  }
  
  /**
   * Checks if tournament can advance to next round
   */
  canAdvanceToNextRound(): boolean {
    for (let i = 0; i < this.knockoutStages.length - 1; i++) {
      const currentStageHasMatches = this.knockoutStages[i].matches.length > 0;
      const nextStageHasMatches = this.knockoutStages[i + 1].matches.length > 0;
      const allCurrentStageFinished = this.knockoutStages[i].matches.every((m: any) => m.status === APP_CONSTANTS.MATCH.STATUS.FINISHED);
      
      if (currentStageHasMatches && !nextStageHasMatches && allCurrentStageFinished) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Gets current stage index
   */
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
  
  /**
   * Advances tournament to next round
   */
  async advanceToNextRound(): Promise<void> {
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

  getTeamsForStage(nextStageIndex: number, qualifiedTeamsLength: number): number {
    // Implementation depends on tournament structure
    return qualifiedTeamsLength;
  }
}