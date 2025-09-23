/**
 * Tournament Card Component
 * 
 * Displays tournament information in a card format with:
 * - Tournament details (name, sport, date)
 * - Matches preview with expandable view
 * - Action menu with context-sensitive options
 * - Editors management modal
 * - Real-time match updates
 * 
 * @author PlayGrouping Team
 * @version 1.0.0
 */

import { Component, Input, Output, EventEmitter, inject, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { 
  IonItem, IonLabel, IonButton, IonIcon, IonContent, IonAvatar, 
  IonList, IonModal, IonHeader, IonToolbar, IonTitle, IonPopover, 
  IonItemSliding, IonItemOptions, IonItemOption, IonChip, IonCard, 
  IonCardContent, IonBadge, IonButtons 
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

// Services
import { AuthService } from '../../../services/auth.service';
import { QrCodeService } from '../../../services/qr-code.service';
import { FirestoreService } from '../../../services/firestore.service';

// Interfaces
import { 
  TournamentWithId, 
  MatchWithTeams, 
  EditAccessEvent, 
  TournamentDeleteEvent 
} from '../../../interfaces';

// Constants
import { APP_CONSTANTS } from '../../../constants/app.constants';
import { TOURNAMENT_CONSTANTS } from '../../../constants/tournament.constants';
import { UI_CONSTANTS } from '../../../constants/ui.constants';

@Component({
  selector: 'app-tournament-card',
  templateUrl: './tournament-card.component.html',
  styleUrls: ['./tournament-card.component.scss'],
  imports: [
    // Angular Common
    CommonModule,
    
    // Ionic Components
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonAvatar,
    IonContent,
    IonHeader,
    IonList,
    IonModal,
    IonTitle,
    IonToolbar,
    IonPopover,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonChip,
    IonCard,
    IonCardContent,
    IonBadge,
    IonButtons
  ],
})
export class TournamentCardComponent implements OnInit, OnDestroy {
  // ========================================
  // COMPONENT INPUTS & OUTPUTS
  // ========================================
  
  /** Tournament data to display */
  @Input() tournament!: TournamentWithId;
  
  /** Event emitted when edit action is triggered */
  @Output() edit = new EventEmitter<string>();
  
  /** Event emitted when delete action is triggered */
  @Output() delete = new EventEmitter<TournamentDeleteEvent>();
  
  /** Event emitted when edit access is requested */
  @Output() askEdit = new EventEmitter<EditAccessEvent>();
  
  /** Event emitted when edit access is approved */
  @Output() approveEditAccess = new EventEmitter<EditAccessEvent>();
  
  /** Event emitted when edit access is removed */
  @Output() removeEditAccess = new EventEmitter<EditAccessEvent>();
  
  /** Event emitted when player registration is requested */
  @Output() registerAsPlayer = new EventEmitter<{ tournamentId: string; tournamentName: string }>();
  
  /** Event emitted when registration status is toggled */
  @Output() toggleRegistration = new EventEmitter<string>();
  
  /** Event emitted when team management is requested */
  @Output() manageTeams = new EventEmitter<string>();

  // ========================================
  // VIEW REFERENCES
  // ========================================
  
  /** Reference to editors modal */
  @ViewChild('editorsListModal') editorsListModal!: IonModal;
  
  /** Presenting element for modals */
  presentingElement!: HTMLElement | null;

  // ========================================
  // CONSTANTS EXPOSED TO TEMPLATE
  // ========================================
  
  /** Tournament-specific constants */
  readonly CONSTANTS = TOURNAMENT_CONSTANTS;
  
  /** App constants */
  readonly APP_CONSTANTS = APP_CONSTANTS;
  
  /** UI constants */
  readonly UI_CONSTANTS = UI_CONSTANTS;

  // ========================================
  // COMPONENT STATE
  // ========================================
  
  /** List of matches for this tournament */
  matches: MatchWithTeams[] = [];
  
  /** List of teams with player data */
  teams: any[] = [];
  
  /** Map of team players for quick lookup */
  teamPlayers: { [teamId: string]: any[] } = {};
  
  /** Whether matches section is expanded */
  isMatchesExpanded = false;
  
  /** Subscription for real-time match updates */
  private matchesSubscription?: Subscription;

  // ========================================
  // DEPENDENCY INJECTION
  // ========================================
  
  /** Authentication service */
  readonly authService = inject(AuthService);
  
  /** QR code service */
  private readonly qrService = inject(QrCodeService);
  
  /** Firestore service */
  private readonly firestoreService = inject(FirestoreService);
  
  /** Router service */
  private readonly router = inject(Router);

  // ========================================
  // LIFECYCLE HOOKS
  // ========================================
  
  /**
   * Component initialization
   * Sets up presenting element and subscribes to match updates
   */
  ngOnInit(): void {
    this.presentingElement = document.querySelector('.ion-page');
    this.subscribeToMatches();
  }
  
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
   * Subscribes to real-time match updates
   * Updates matches array and loads team players when changes occur
   */
  private subscribeToMatches(): void {
    this.matchesSubscription = this.firestoreService
      .getMatchesWithTeamsLive(this.tournament.id)
      .subscribe(matches => {
        this.matches = matches;
        this.loadTeamPlayers();
      });
  }

  /**
   * Loads team players data for avatar display
   * Creates a lookup map for quick access to player information
   */
  private async loadTeamPlayers(): Promise<void> {
    try {
      this.teams = await this.firestoreService.getTeamsWithPlayers(this.tournament.id);
      
      // Create a map of team players for quick lookup
      for (const team of this.teams) {
        this.teamPlayers[team.id] = team.players || [];
      }
    } catch (error) {
      console.error('Error loading team players:', error);
    }
  }

  // ========================================
  // PERMISSION GETTERS
  // ========================================
  
  /** Checks if user can delete tournament */
  get canDelete(): boolean {
    return this.authService.hasPermission('admin', this.tournament);
  }

  /** Checks if user can request edit access */
  get canAskEdit(): boolean {
    return (
      !!this.authService.user?.email &&
      !this.authService.hasPermission('admin', this.tournament)
    );
  }

  /** Checks if user can edit tournament */
  get canEdit(): boolean {
    return this.authService.hasPermission('editor', this.tournament);
  }

  /** Checks if user can view tournament details */
  get canView(): boolean {
    return this.authService.hasPermission('viewer', this.tournament);
  }

  /** Checks if user can register as player */
  get canRegisterAsPlayer(): boolean {
    return (
      !!this.authService.user?.email &&
      !!this.tournament.registrationOpen
    );
  }

  /** Checks if user can manage registration */
  get canManageRegistration(): boolean {
    return this.authService.hasPermission('editor', this.tournament) || 
           this.authService.hasPermission('admin', this.tournament);
  }

  // ========================================
  // TEMPLATE HELPER METHODS
  // ========================================
  
  /**
   * Formats tournament date for display
   */
  formatTournamentDate(date: any): string {
    if (!date) return '';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric' 
    });
  }
  
  /**
   * Gets tournament menu trigger ID
   */
  getTournamentMenuId(): string {
    return `tournament-menu-${this.tournament.id}`;
  }
  
  /**
   * Gets expand/collapse icon based on current state
   */
  getExpandIcon(): string {
    return this.isMatchesExpanded ? 
      TOURNAMENT_CONSTANTS.ICONS.CHEVRON_UP : 
      TOURNAMENT_CONSTANTS.ICONS.CHEVRON_DOWN;
  }
  
  /**
   * Checks if tournament has matches
   */
  hasMatches(): boolean {
    return this.matches.length > 0;
  }
  
  /**
   * Gets preview matches (limited number for display)
   */
  getPreviewMatches(): MatchWithTeams[] {
    return this.matches.slice(0, TOURNAMENT_CONSTANTS.DISPLAY.MAX_MATCHES_PREVIEW);
  }
  
  /**
   * Checks if there are more matches than preview limit
   */
  hasMoreMatches(): boolean {
    return this.matches.length > TOURNAMENT_CONSTANTS.DISPLAY.MAX_MATCHES_PREVIEW;
  }
  
  /**
   * Gets text for additional matches count
   */
  getMoreMatchesText(): string {
    const additionalCount = this.matches.length - TOURNAMENT_CONSTANTS.DISPLAY.MAX_MATCHES_PREVIEW;
    return `${additionalCount} ${TOURNAMENT_CONSTANTS.LABELS.MORE_MATCHES}`;
  }
  
  /**
   * Checks if registration is open
   */
  isRegistrationOpen(): boolean {
    return !!this.tournament.registrationOpen;
  }
  
  /**
   * Gets registration toggle icon
   */
  getRegistrationToggleIcon(): string {
    return this.tournament.registrationOpen ? 
      TOURNAMENT_CONSTANTS.ICONS.LOCK_CLOSED : 
      TOURNAMENT_CONSTANTS.ICONS.LOCK_OPEN;
  }
  
  /**
   * Gets registration toggle color
   */
  getRegistrationToggleColor(): string {
    return this.tournament.registrationOpen ? 'danger' : 'success';
  }
  
  /**
   * Gets registration toggle text
   */
  getRegistrationToggleText(): string {
    return this.tournament.registrationOpen ? 
      TOURNAMENT_CONSTANTS.ACTIONS.CLOSE_REGISTRATION : 
      TOURNAMENT_CONSTANTS.ACTIONS.OPEN_REGISTRATION;
  }
  
  /**
   * Checks if tournament has no editors
   */
  hasNoEditors(): boolean {
    return this.tournament.editors.length === 0;
  }
  
  /**
   * Checks if editor is approved
   */
  isEditorApproved(editor: any): boolean {
    return editor.approved;
  }
  
  /**
   * Checks if current user can manage editor
   */
  canManageEditor(editor: any): boolean {
    return editor.email !== this.authService.user?.email;
  }
  
  /**
   * Checks if editor can be approved
   */
  canApproveEditor(editor: any): boolean {
    return !editor.approved;
  }

  // ========================================
  // UI HELPER METHODS
  // ========================================
  
  /**
   * Gets shortened team name for display
   */
  getShortTeamName(teamName: string): string {
    if (!teamName) return 'Unknown';
    return teamName.length > TOURNAMENT_CONSTANTS.DISPLAY.MAX_TEAM_NAME_LENGTH ? 
      teamName.substring(0, TOURNAMENT_CONSTANTS.DISPLAY.MAX_TEAM_NAME_LENGTH) + '...' : 
      teamName;
  }

  /**
   * Gets CSS class for match status
   */
  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case TOURNAMENT_CONSTANTS.STATUS.ONGOING:
      case TOURNAMENT_CONSTANTS.STATUS.STARTED:
        return 'status-ongoing';
      case TOURNAMENT_CONSTANTS.STATUS.SCHEDULED:
      case TOURNAMENT_CONSTANTS.STATUS.PENDING:
        return 'status-scheduled';
      case TOURNAMENT_CONSTANTS.STATUS.COMPLETED:
      case TOURNAMENT_CONSTANTS.STATUS.FINISHED:
        return 'status-completed';
      case TOURNAMENT_CONSTANTS.STATUS.CANCELLED:
        return 'status-cancelled';
      default:
        return 'status-scheduled';
    }
  }

  /**
   * Gets display text for match status
   */
  getStatusText(status: string): string {
    switch (status?.toLowerCase()) {
      case TOURNAMENT_CONSTANTS.STATUS.ONGOING:
      case TOURNAMENT_CONSTANTS.STATUS.STARTED:
        return TOURNAMENT_CONSTANTS.STATUS_TEXT.LIVE;
      case TOURNAMENT_CONSTANTS.STATUS.SCHEDULED:
      case TOURNAMENT_CONSTANTS.STATUS.PENDING:
        return TOURNAMENT_CONSTANTS.STATUS_TEXT.SCHEDULED;
      case TOURNAMENT_CONSTANTS.STATUS.COMPLETED:
      case TOURNAMENT_CONSTANTS.STATUS.FINISHED:
        return TOURNAMENT_CONSTANTS.STATUS_TEXT.COMPLETED;
      case TOURNAMENT_CONSTANTS.STATUS.CANCELLED:
        return TOURNAMENT_CONSTANTS.STATUS_TEXT.CANCELLED;
      default:
        return TOURNAMENT_CONSTANTS.STATUS_TEXT.SCHEDULED;
    }
  }

  /**
   * Gets avatar URL with fallback
   */
  getAvatarUrl(item: any): string {
    return item.photoURL || `${this.APP_CONSTANTS.ASSETS.PRAVATAR_BASE}${item.email}`;
  }

  /**
   * Gets team player photo for match display
   */
  getTeamPlayerPhoto(match: MatchWithTeams, teamNumber: 1 | 2): string {
    const teamId = teamNumber === 1 ? match.team1Id : match.team2Id;
    const players = this.teamPlayers[teamId] || [];
    
    // Get the first player's photo, or use a default
    if (players.length > 0 && players[0].photoURL) {
      return players[0].photoURL;
    }
    
    // Fallback to a default avatar or generate one based on team name
    const teamName = teamNumber === 1 ? match.team1Name : match.team2Name;
    return this.getAvatarUrl({ email: teamName, photoURL: null });
  }

  // ========================================
  // EVENT HANDLERS
  // ========================================
  
  /**
   * Toggles matches section expansion
   */
  toggleMatches(): void {
    this.isMatchesExpanded = !this.isMatchesExpanded;
  }

  /**
   * Handles match click navigation
   */
  onMatchClick(matchId: string): void {
    this.router.navigate([this.APP_CONSTANTS.ROUTES.MATCH_CONTROL, matchId], { 
      queryParams: { tournamentId: this.tournament.id } 
    });
  }

  /**
   * Handles edit tournament action
   */
  onEdit(): void {
    this.edit.emit(this.tournament.id);
  }

  /**
   * Handles delete tournament action
   */
  onDelete(): void {
    this.delete.emit({ id: this.tournament.id, name: this.tournament.name });
  }

  /**
   * Handles edit access request
   */
  onAskEdit(): void {
    this.askEdit.emit({
      id: this.tournament.id,
      tournament: this.tournament,
      email: this.authService.user?.email!,
      displayName: this.authService.user?.displayName!,
      photoURL: this.authService.user?.photoURL!,
    });
  }

  /**
   * Handles QR code printing
   */
  onPrintQR(): void {
    this.qrService.printQRCode(this.tournament.id, this.tournament.name);
  }

  /**
   * Handles player registration
   */
  onRegisterAsPlayer(): void {
    this.registerAsPlayer.emit({
      tournamentId: this.tournament.id,
      tournamentName: this.tournament.name
    });
  }

  /**
   * Handles registration toggle
   */
  onToggleRegistration(): void {
    this.toggleRegistration.emit(this.tournament.id);
  }

  /**
   * Handles team management navigation
   */
  onManageTeams(): void {
    this.manageTeams.emit(this.tournament.id);
  }

  /**
   * Handles editor approval
   */
  onApproveEditAccess(email: string): void {
    this.approveEditAccess.emit({
      id: this.tournament.id, 
      tournament: this.tournament, 
      email: email, 
      displayName: '', 
      photoURL: ''
    });
  }

  /**
   * Handles editor removal
   */
  onRemoveEditor(email: string): void {
    this.removeEditAccess.emit({
      id: this.tournament.id, 
      tournament: this.tournament, 
      email: email, 
      displayName: '', 
      photoURL: ''
    });
  }

  /**
   * Opens editors management modal
   */
  openEditorsModal(): void {
    this.editorsListModal.present();
  }

  // ========================================
  // NAVIGATION METHODS
  // ========================================
  
  /**
   * Navigates to scoreboard page
   */
  navigateToScoreboard(): void {
    this.router.navigate(['/scoreboard', this.tournament.id]);
  }

  /**
   * Navigates to knockout page
   */
  navigateToKnockout(): void {
    this.router.navigate(['/knockout', this.tournament.id]);
  }
}