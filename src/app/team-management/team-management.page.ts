/**
 * Team Management Page Component
 * 
 * This component handles the management of player registrations and team creation/editing.
 * It provides functionality for:
 * - Viewing and managing player registrations (approve, reject, delete)
 * - Creating and editing teams with selected players
 * - Real-time updates for registration status changes
 * - Search functionality for both registrations and teams
 * 
 * @author PlayGrouping Team
 * @version 1.0.0
 */

import { Component, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBackButton,
  IonButtons,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  LoadingController,
  ToastController,
  AlertController,
  IonNote,
  IonText,
  IonChip,
  IonAvatar,
  IonItemSliding,
  IonItemOption,
  IonItemOptions, 
  IonSearchbar, 
  IonSegmentButton, 
  IonBadge, 
  IonSegment, 
  IonButton, 
  IonCheckbox, 
  IonModal, 
  IonInput 
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';

// Services
import { FirestoreService } from '../services/firestore.service';
import { AuthService } from '../services/auth.service';

// Interfaces
import {
  TournamentWithId,
  Team,
  PlayerRegistration,
  UserProfile,
  TeamPlayerWithUser,
} from '../interfaces';

// Constants
import { UI_CONSTANTS, CSS_CLASSES, TEXT_CONSTANTS } from '../constants/ui.constants';

// Icons
import { addIcons } from 'ionicons';
import {
  addOutline,
  peopleOutline,
  personOutline,
  mailOutline,
  checkmarkCircleOutline,
  timeOutline,
  searchOutline,
  warningOutline,
  closeOutline,
  checkmarkOutline,
  trashOutline,
  createOutline,
  chevronForwardOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-team-management',
  templateUrl: './team-management.page.html',
  styleUrls: ['./team-management.page.scss'],
  imports: [
    // Angular Common
    CommonModule,
    FormsModule,
    
    // Ionic Components
    IonInput, 
    IonModal, 
    IonCheckbox, 
    IonButton, 
    IonSegment, 
    IonBadge, 
    IonSegmentButton, 
    IonSearchbar,
    IonItemOptions,
    IonItemOption,
    IonItemSliding,
    IonAvatar,
    IonChip,
    IonText,
    IonNote,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonBackButton,
    IonButtons,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
  ],
})
export class TeamManagementPage implements OnDestroy {
  // ========================================
  // DEPENDENCY INJECTION
  // ========================================
  
  /** Firestore service for database operations */
  private readonly firestoreService = inject(FirestoreService);
  
  /** Route service for accessing route parameters */
  private readonly route = inject(ActivatedRoute);
  
  /** Loading controller for showing loading indicators */
  private readonly loadingController = inject(LoadingController);
  
  /** Toast controller for showing toast messages */
  private readonly toastController = inject(ToastController);
  
  /** Alert controller for showing confirmation dialogs */
  private readonly alertController = inject(AlertController);
  
  /** Authentication service for user permissions */
  private readonly authService = inject(AuthService);
  
  /** Change detector for manual change detection */
  private readonly cdr = inject(ChangeDetectorRef);

  // ========================================
  // CONSTANTS EXPOSED TO TEMPLATE
  // ========================================
  
  /** UI constants for template usage */
  readonly UI_CONSTANTS = UI_CONSTANTS;
  
  /** CSS class constants for template usage */
  readonly CSS_CLASSES = CSS_CLASSES;
  
  /** Text constants for template usage */
  readonly TEXT = TEXT_CONSTANTS;
  
  /** Route constants */
  readonly ROUTES = {
    TOURNAMENTS: '/tournaments',
  };
  
  /** Tab values */
  readonly TAB_VALUES = {
    REGISTRATIONS: 'registrations',
    TEAMS: 'teams',
  };
  
  /** Icon constants */
  readonly ICONS = {
    ADD: 'add-outline',
    PERSON: 'person-outline',
    WARNING: 'warning-outline',
    SEARCH: 'search-outline',
    CHECKMARK: 'checkmark-outline',
    CHECKMARK_CIRCLE: 'checkmark-circle-outline',
    CLOSE: 'close-outline',
    TRASH: 'trash-outline',
    CREATE: 'create-outline',
    TIME: 'time-outline',
    CHEVRON_FORWARD: 'chevron-forward-outline',
  };
  
  /** Preview player limit for team display */
  private readonly PREVIEW_PLAYER_LIMIT = 2;

  // ========================================
  // COMPONENT STATE
  // ========================================
  
  /** Current tournament ID */
  tournamentId = '';
  
  /** Tournament data */
  tournament: TournamentWithId | null = null;
  
  /** Player registrations list */
  registrations: (PlayerRegistration & UserProfile)[] = [];
  
  /** Teams list with player data */
  teams: (Team & { players: TeamPlayerWithUser[] })[] = [];
  
  /** Modal visibility state */
  showTeamModal = false;
  
  /** Current team being created/edited */
  currentTeam: { name: string; players: { id: string; name: string }[] } = {
    name: '',
    players: [],
  };
  
  /** Team being edited (null for new team) */
  editingTeam: (Team & { players: TeamPlayerWithUser[] }) | null = null;
  
  /** Search text for filtering */
  searchText = '';
  
  /** Currently selected tab */
  selectedTab = this.TAB_VALUES.REGISTRATIONS;
  
  /** Subscription for real-time registration updates */
  private registrationSubscription?: Subscription;

  // ========================================
  // CONSTRUCTOR
  // ========================================
  
  constructor() {
    // Register all required icons for the component
    this.registerIcons();
  }
  
  /**
   * Registers all ionicons used in this component
   * This ensures icons are available when the component loads
   */
  private registerIcons(): void {
    addIcons({
      addOutline,
      peopleOutline,
      personOutline,
      mailOutline,
      checkmarkCircleOutline,
      timeOutline,
      searchOutline,
      warningOutline,
      closeOutline,
      checkmarkOutline,
      trashOutline,
      createOutline,
      chevronForwardOutline,
    });
  }

  // ========================================
  // LIFECYCLE HOOKS
  // ========================================
  
  /**
   * Component initialization
   * Extracts tournament ID from route and loads initial data
   */
  async ngOnInit(): Promise<void> {
    // Extract tournament ID from route parameters
    this.tournamentId = this.route.snapshot.params['id'];
    
    // Load initial component data
    await this.loadData();
  }
  
  /**
   * Component cleanup
   * Unsubscribes from all active subscriptions to prevent memory leaks
   */
  ngOnDestroy(): void {
    this.unsubscribeFromRegistrations();
  }

  // ========================================
  // DATA LOADING METHODS
  // ========================================
  
  /**
   * Loads all component data including tournament, registrations, and teams
   * Shows loading indicator during the process
   */
  private async loadData(): Promise<void> {
    const loading = await this.createLoadingIndicator('Loading team data...');
    await loading.present();

    try {
      // Load tournament data
      await this.loadTournamentData();
      
      // Subscribe to live registration updates
      this.subscribeToRegistrations();
      
      // Load teams data
      await this.loadTeamsData();
      
    } catch (error) {
      console.error('Error loading data:', error);
      await this.showErrorToast('Failed to load data');
    } finally {
      await loading.dismiss();
    }
  }
  
  /**
   * Loads tournament data from Firestore
   */
  private async loadTournamentData(): Promise<void> {
    this.tournament = await this.firestoreService.getTournament(this.tournamentId);
  }
  
  /**
   * Subscribes to live registration updates
   * Updates the registrations array when changes occur in Firestore
   */
  private subscribeToRegistrations(): void {
    this.registrationSubscription = this.firestoreService
      .getPlayerRegistrationsLive(this.tournamentId)
      .subscribe((registrations) => {
        this.registrations = registrations;
        this.cdr.detectChanges(); // Force change detection for real-time updates
      });
  }
  
  /**
   * Loads teams data with player information
   */
  private async loadTeamsData(): Promise<void> {
    this.teams = await this.firestoreService.getTeamsWithPlayers(this.tournamentId);
  }
  
  /**
   * Unsubscribes from registration updates to prevent memory leaks
   */
  private unsubscribeFromRegistrations(): void {
    if (this.registrationSubscription) {
      this.registrationSubscription.unsubscribe();
    }
  }

  // ========================================
  // COMPUTED PROPERTIES
  // ========================================
  
  /**
   * Returns only approved registrations
   * Used for team player selection
   */
  get approvedRegistrations(): (PlayerRegistration & UserProfile)[] {
    return this.registrations.filter((reg) => reg.status === TEXT_CONSTANTS.STATUS.APPROVED);
  }

  /**
   * Returns filtered registrations based on search text
   * Searches in both name and email fields
   */
  get filteredRegistrations(): (PlayerRegistration & UserProfile)[] {
    if (!this.hasSearchText()) {
      return this.registrations;
    }
    
    const searchLower = this.searchText.toLowerCase();
    return this.registrations.filter((reg) =>
      reg.name.toLowerCase().includes(searchLower) ||
      reg.email.toLowerCase().includes(searchLower)
    );
  }
  
  /**
   * Returns filtered teams based on search text
   * Searches in team name field
   */
  get filteredTeams(): (Team & { players: TeamPlayerWithUser[] })[] {
    if (!this.hasSearchText()) {
      return this.teams;
    }
    
    const searchLower = this.searchText.toLowerCase();
    return this.teams.filter((team) =>
      team.name.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Returns registrations available for team assignment
   * Excludes players already assigned to other teams (except current editing team)
   */
  get availableRegistrations(): (PlayerRegistration & UserProfile)[] {
    // Get all assigned player IDs from existing teams
    const assignedPlayerIds = this.getAssignedPlayerIds();

    return this.approvedRegistrations.filter((reg) =>
      // Include if not assigned to any team
      !assignedPlayerIds.has(reg.userId) ||
      // Or if assigned to the team currently being edited
      this.isPlayerInEditingTeam(reg.userId)
    );
  }
  
  /**
   * Gets all player IDs that are currently assigned to teams
   */
  private getAssignedPlayerIds(): Set<string> {
    const assignedPlayerIds = new Set<string>();
    
    this.teams.forEach((team) => {
      team.players.forEach((player) => {
        assignedPlayerIds.add(player.userId);
      });
    });
    
    return assignedPlayerIds;
  }
  
  /**
   * Checks if a player is in the team currently being edited
   */
  private isPlayerInEditingTeam(userId: string): boolean {
    return this.editingTeam?.players.some((p) => p.userId === userId) ?? false;
  }

  /**
   * Determines if the current user can edit teams and registrations
   */
  get canEdit(): boolean {
    if (!this.tournament?.id) {
      return false;
    }
    
    return this.authService.hasPermission('editor', this.tournament);
  }

  // ========================================
  // TEMPLATE HELPER METHODS
  // ========================================
  
  /**
   * Checks if registrations tab is currently selected
   */
  isRegistrationsTab(): boolean {
    return this.selectedTab === this.TAB_VALUES.REGISTRATIONS;
  }
  
  /**
   * Checks if teams tab is currently selected
   */
  isTeamsTab(): boolean {
    return this.selectedTab === this.TAB_VALUES.TEAMS;
  }
  
  /**
   * Checks if there are any registrations
   */
  hasRegistrations(): boolean {
    return this.registrations.length > 0 && this.isRegistrationsTab();
  }
  
  /**
   * Checks if there are any teams
   */
  hasTeams(): boolean {
    return this.teams.length > 0 && this.isTeamsTab();
  }
  
  /**
   * Checks if search returned no results for registrations
   */
  isNoSearchResults(): boolean {
    return this.filteredRegistrations.length === 0 && this.hasSearchText();
  }
  
  /**
   * Checks if search returned no results for teams
   */
  isNoTeamSearchResults(): boolean {
    return this.filteredTeams.length === 0 && this.hasSearchText();
  }
  
  /**
   * Checks if there are no registrations at all
   */
  isNoRegistrations(): boolean {
    return this.registrations.length === 0;
  }
  
  /**
   * Checks if there are no teams at all
   */
  isNoTeams(): boolean {
    return this.teams.length === 0;
  }
  
  /**
   * Checks if there is search text entered
   */
  private hasSearchText(): boolean {
    return this.searchText.trim().length > 0;
  }
  
  /**
   * Gets the appropriate avatar URL for a player
   */
  getPlayerAvatarUrl(player: PlayerRegistration & UserProfile): string {
    return player.photoURL || UI_CONSTANTS.DEFAULTS.AVATAR_URL;
  }
  
  /**
   * Checks if a registration has pending status
   */
  isPendingStatus(status: string): boolean {
    return status === TEXT_CONSTANTS.STATUS.PENDING;
  }
  
  /**
   * Gets preview players (first 2) for team display
   */
  getPreviewPlayers(players: TeamPlayerWithUser[]): TeamPlayerWithUser[] {
    return players.slice(0, this.PREVIEW_PLAYER_LIMIT);
  }
  
  /**
   * Gets separator between player names
   */
  getPlayerSeparator(isLast: boolean, totalPlayers: number): string {
    return !isLast && totalPlayers > 1 ? ', ' : '';
  }
  
  /**
   * Checks if there are more players than the preview limit
   */
  hasMorePlayers(playerCount: number): boolean {
    return playerCount > this.PREVIEW_PLAYER_LIMIT;
  }
  
  /**
   * Gets text for additional players count
   */
  getMorePlayersText(playerCount: number): string {
    const additionalCount = playerCount - this.PREVIEW_PLAYER_LIMIT;
    return ` +${additionalCount} more`;
  }
  
  /**
   * Checks if a team is active (has players)
   */
  isActiveTeam(playerCount: number): boolean {
    return playerCount > 0;
  }
  
  /**
   * Checks if there are available players for team selection
   */
  hasAvailablePlayers(): boolean {
    return this.availableRegistrations.length > 0;
  }
  
  /**
   * Checks if there are no available players
   */
  isNoAvailablePlayers(): boolean {
    return this.availableRegistrations.length === 0;
  }
  
  // ========================================
  // EVENT HANDLERS
  // ========================================
  
  /**
   * Handles tab change event
   * Clears search text when switching tabs
   */
  onTabChange(): void {
    this.searchText = '';
  }
  
  /**
   * Handles modal dismiss event
   */
  onModalDismiss(): void {
    this.showTeamModal = false;
  }
  
  /**
   * Handles approve registration with sliding item close
   */
  handleApproveRegistration(slidingItem: IonItemSliding, registration: PlayerRegistration & UserProfile): void {
    slidingItem.close();
    this.approveRegistration(registration);
  }
  
  /**
   * Handles reject registration with sliding item close
   */
  handleRejectRegistration(slidingItem: IonItemSliding, registration: PlayerRegistration & UserProfile): void {
    slidingItem.close();
    this.rejectRegistration(registration);
  }
  
  /**
   * Handles delete registration with sliding item close
   */
  handleDeleteRegistration(slidingItem: IonItemSliding, registration: PlayerRegistration & UserProfile): void {
    slidingItem.close();
    this.deleteRegistration(registration);
  }
  
  /**
   * Handles edit team with sliding item close
   */
  handleEditTeam(slidingItem: IonItemSliding, team: Team & { players: TeamPlayerWithUser[] }): void {
    slidingItem.close();
    this.openTeamModal(team);
  }
  
  /**
   * Handles delete team with sliding item close
   */
  handleDeleteTeam(slidingItem: IonItemSliding, team: Team & { players: TeamPlayerWithUser[] }): void {
    slidingItem.close();
    this.deleteTeam(team);
  }
  
  /**
   * Toggles player selection in team modal
   */
  togglePlayerSelection(registration: PlayerRegistration & UserProfile): void {
    const isCurrentlySelected = this.isPlayerSelected(registration);
    this.onPlayerSelectionChange(registration, !isCurrentlySelected);
  }
  
  // ========================================
  // MODAL METHODS
  // ========================================
  
  /**
   * Opens the team creation/editing modal
   * @param team - Team to edit (optional, null for new team)
   */
  openTeamModal(team?: Team & { players: TeamPlayerWithUser[] }): void {
    this.editingTeam = team || null;
    this.currentTeam = this.initializeCurrentTeam(team);
    this.showTeamModal = true;
  }
  
  /**
   * Initializes the current team object for modal
   */
  private initializeCurrentTeam(team?: Team & { players: TeamPlayerWithUser[] }): { name: string; players: { id: string; name: string }[] } {
    if (team) {
      return {
        name: team.name,
        players: team.players.map((p) => ({ id: p.userId, name: p.name })),
      };
    }
    
    return { name: '', players: [] };
  }
  
  /**
   * Closes the team modal
   */
  closeModal(): void {
    this.showTeamModal = false;
  }
  
  /**
   * Gets the appropriate icon for modal title
   */
  getModalIcon(): string {
    return this.editingTeam ? this.ICONS.CREATE : this.ICONS.ADD;
  }
  
  /**
   * Gets the modal title text
   */
  getModalTitle(): string {
    return this.editingTeam ? TEXT_CONSTANTS.LABELS.EDIT_TEAM : TEXT_CONSTANTS.LABELS.CREATE_TEAM;
  }
  
  /**
   * Gets the save button icon
   */
  getSaveButtonIcon(): string {
    return this.editingTeam ? this.ICONS.CHECKMARK : this.ICONS.ADD;
  }
  
  /**
   * Gets the save button text
   */
  getSaveButtonText(): string {
    return this.editingTeam ? TEXT_CONSTANTS.LABELS.UPDATE_TEAM : TEXT_CONSTANTS.LABELS.CREATE_TEAM;
  }

  // ========================================
  // TEAM MANAGEMENT METHODS
  // ========================================
  
  /**
   * Saves the current team (create or update)
   * Validates team name and handles both creation and update scenarios
   */
  async saveTeam(): Promise<void> {
    // Validate team name
    if (!this.isValidTeamName()) {
      return;
    }

    const loading = await this.createLoadingIndicator(
      this.editingTeam ? 'Updating team...' : 'Creating team...'
    );
    await loading.present();

    try {
      const playerIds = this.currentTeam.players.map((p) => p.id);

      if (this.editingTeam) {
        await this.updateExistingTeam(playerIds);
      } else {
        await this.createNewTeam(playerIds);
      }

      // Reload data and close modal
      await this.loadTeamsData();
      this.closeModal();

      // Show success message
      await this.showSuccessToast(
        `Team ${this.editingTeam ? 'updated' : 'created'} successfully!`
      );
      
    } catch (error) {
      console.error('Error saving team:', error);
      await this.showErrorToast('Error saving team');
    } finally {
      await loading.dismiss();
    }
  }
  
  /**
   * Validates if the team name is valid
   */
  private isValidTeamName(): boolean {
    return this.currentTeam.name.trim().length > 0;
  }
  
  /**
   * Updates an existing team
   */
  private async updateExistingTeam(playerIds: string[]): Promise<void> {
    if (!this.editingTeam?.id) {
      throw new Error('No team ID for update');
    }
    
    await this.firestoreService.updateTeam(
      this.tournamentId,
      this.editingTeam.id,
      { name: this.currentTeam.name },
      playerIds
    );
  }
  
  /**
   * Creates a new team
   */
  private async createNewTeam(playerIds: string[]): Promise<void> {
    await this.firestoreService.createTeam(
      this.tournamentId,
      { name: this.currentTeam.name },
      playerIds
    );
  }

  /**
   * Initiates team deletion with confirmation dialog
   */
  async deleteTeam(team: Team & { players: TeamPlayerWithUser[] }): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete Team',
      message: `Are you sure you want to permanently delete the team "${team.name}"? This action cannot be undone.`,
      buttons: [
        { text: TEXT_CONSTANTS.LABELS.CANCEL, role: 'cancel' },
        {
          text: TEXT_CONSTANTS.LABELS.DELETE,
          role: 'destructive',
          handler: () => this.performDeleteTeam(team),
        },
      ],
    });
    await alert.present();
  }

  /**
   * Performs the actual team deletion
   */
  private async performDeleteTeam(team: Team & { players: TeamPlayerWithUser[] }): Promise<void> {
    if (!team.id) {
      await this.showErrorToast('Invalid team ID');
      return;
    }
    
    const loading = await this.createLoadingIndicator('Deleting team...');
    await loading.present();

    try {
      await this.firestoreService.deleteTeam(this.tournamentId, team.id);
      await this.loadTeamsData();
      await this.showSuccessToast('Team deleted successfully!');
    } catch (error) {
      console.error('Error deleting team:', error);
      await this.showErrorToast('Error deleting team');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Handles player selection change in team modal
   * Adds or removes player from current team and updates team name
   */
  onPlayerSelectionChange(
    registration: PlayerRegistration & UserProfile,
    checked: boolean
  ): void {
    if (checked) {
      this.addPlayerToTeam(registration);
    } else {
      this.removePlayerFromTeam(registration.userId);
    }
    
    // Auto-generate team name based on selected players
    this.generateTeamName();
  }
  
  /**
   * Adds a player to the current team
   */
  private addPlayerToTeam(registration: PlayerRegistration & UserProfile): void {
    this.currentTeam.players.push({
      id: registration.userId,
      name: registration.name,
    });
  }
  
  /**
   * Removes a player from the current team
   */
  private removePlayerFromTeam(userId: string): void {
    this.currentTeam.players = this.currentTeam.players.filter(
      (p) => p.id !== userId
    );
  }

  /**
   * Auto-generates team name based on selected players
   * Joins player names with ' & ' separator
   */
  private generateTeamName(): void {
    if (this.currentTeam.players.length > 0) {
      this.currentTeam.name = this.currentTeam.players
        .map((p) => p.name)
        .join(' & ');
    } else {
      this.currentTeam.name = '';
    }
  }

  /**
   * Checks if a player is currently selected for the team
   */
  isPlayerSelected(registration: PlayerRegistration & UserProfile): boolean {
    return this.currentTeam.players.some((p) => p.id === registration.userId);
  }

  // ========================================
  // REGISTRATION MANAGEMENT METHODS
  // ========================================
  
  /**
   * Initiates registration approval with confirmation dialog
   */
  async approveRegistration(registration: PlayerRegistration & UserProfile): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Approve Registration',
      message: `Are you sure you want to approve ${registration.name}'s registration?`,
      buttons: [
        { text: TEXT_CONSTANTS.LABELS.CANCEL, role: 'cancel' },
        {
          text: TEXT_CONSTANTS.LABELS.APPROVE,
          handler: () => this.performApproveRegistration(registration),
        },
      ],
    });
    await alert.present();
  }

  /**
   * Performs the actual registration approval
   */
  private async performApproveRegistration(
    registration: PlayerRegistration & UserProfile
  ): Promise<void> {
    if (!registration.id) {
      await this.showErrorToast('Invalid registration ID');
      return;
    }
    
    const loading = await this.createLoadingIndicator('Approving registration...');
    await loading.present();

    try {
      await this.firestoreService.updatePlayerRegistration(
        this.tournamentId,
        registration.id,
        { status: TEXT_CONSTANTS.STATUS.APPROVED }
      );

      await this.showSuccessToast('Registration approved successfully!');
    } catch (error) {
      console.error('Error approving registration:', error);
      await this.showErrorToast('Error approving registration');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Initiates registration rejection with confirmation dialog
   */
  async rejectRegistration(registration: PlayerRegistration & UserProfile): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Reject Registration',
      message: `Are you sure you want to reject ${registration.name}'s registration?`,
      buttons: [
        { text: TEXT_CONSTANTS.LABELS.CANCEL, role: 'cancel' },
        {
          text: TEXT_CONSTANTS.LABELS.REJECT,
          handler: () => this.performRejectRegistration(registration),
        },
      ],
    });
    await alert.present();
  }

  /**
   * Performs the actual registration rejection
   */
  private async performRejectRegistration(
    registration: PlayerRegistration & UserProfile
  ): Promise<void> {
    if (!registration.id) {
      await this.showErrorToast('Invalid registration ID');
      return;
    }
    
    const loading = await this.createLoadingIndicator('Rejecting registration...');
    await loading.present();

    try {
      await this.firestoreService.updatePlayerRegistration(
        this.tournamentId,
        registration.id,
        { status: TEXT_CONSTANTS.STATUS.REJECTED }
      );

      await this.showWarningToast('Registration rejected.');
    } catch (error) {
      console.error('Error rejecting registration:', error);
      await this.showErrorToast('Error rejecting registration');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Initiates registration deletion with confirmation dialog
   */
  async deleteRegistration(registration: PlayerRegistration & UserProfile): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete Registration',
      message: `Are you sure you want to permanently delete ${registration.name}'s registration? This action cannot be undone.`,
      buttons: [
        { text: TEXT_CONSTANTS.LABELS.CANCEL, role: 'cancel' },
        {
          text: TEXT_CONSTANTS.LABELS.DELETE,
          role: 'destructive',
          handler: () => this.performDeleteRegistration(registration),
        },
      ],
    });
    await alert.present();
  }

  /**
   * Performs the actual registration deletion
   */
  private async performDeleteRegistration(
    registration: PlayerRegistration & UserProfile
  ): Promise<void> {
    if (!registration.id) {
      await this.showErrorToast('Invalid registration ID');
      return;
    }
    
    const loading = await this.createLoadingIndicator('Deleting registration...');
    await loading.present();

    try {
      await this.firestoreService.deletePlayerRegistration(
        this.tournamentId,
        registration.id
      );

      await this.showSuccessToast('Registration deleted.');
    } catch (error) {
      console.error('Error deleting registration:', error);
      await this.showErrorToast('Error deleting registration');
    } finally {
      await loading.dismiss();
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================
  
  /**
   * Gets the appropriate color for registration status
   */
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case TEXT_CONSTANTS.STATUS.APPROVED:
        return 'success';
      case TEXT_CONSTANTS.STATUS.PENDING:
        return 'warning';
      case TEXT_CONSTANTS.STATUS.REJECTED:
        return 'danger';
      default:
        return 'medium';
    }
  }

  /**
   * Gets the appropriate icon for registration status
   */
  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case TEXT_CONSTANTS.STATUS.APPROVED:
        return this.ICONS.CHECKMARK_CIRCLE;
      case TEXT_CONSTANTS.STATUS.PENDING:
        return this.ICONS.TIME;
      case TEXT_CONSTANTS.STATUS.REJECTED:
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  }
  
  // ========================================
  // HELPER METHODS FOR UI COMPONENTS
  // ========================================
  
  /**
   * Creates a loading indicator with the specified message
   */
  private async createLoadingIndicator(message: string) {
    return await this.loadingController.create({ message });
  }
  
  /**
   * Shows a success toast message
   */
  private async showSuccessToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'success',
    });
    await toast.present();
  }
  
  /**
   * Shows an error toast message
   */
  private async showErrorToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
    });
    await toast.present();
  }
  
  /**
   * Shows a warning toast message
   */
  private async showWarningToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'warning',
    });
    await toast.present();
  }
}

/**
 * Type definitions for better type safety
 */
type TeamWithPlayers = Team & { players: TeamPlayerWithUser[] };
type RegistrationWithUser = PlayerRegistration & UserProfile;