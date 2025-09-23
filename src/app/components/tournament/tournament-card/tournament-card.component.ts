import { Component, Input, Output, EventEmitter, inject, ViewChild } from '@angular/core';
import { 
  IonItem, IonLabel, IonButton, IonIcon, IonContent, IonAvatar, IonImg, 
  IonList, IonModal, IonHeader, IonToolbar, IonTitle, IonPopover, 
  IonItemSliding, IonItemOptions, IonItemOption, IonChip, IonCard, 
  IonCardContent, IonBadge, IonButtons 
} from '@ionic/angular/standalone';
import { RouterLink, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { QrCodeService } from '../../../services/qr-code.service';
import { FirestoreService } from '../../../services/firestore.service';
import { TournamentWithId, Match, MatchWithTeams, EditAccessEvent, TournamentDeleteEvent } from '../../../interfaces';
import { APP_CONSTANTS } from '../../../constants/app.constants';

@Component({
  selector: 'app-tournament-card',
  templateUrl: './tournament-card.component.html',
  styleUrls: ['./tournament-card.component.scss'],
  imports: [
    CommonModule,

    DatePipe,
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
export class TournamentCardComponent {
  @ViewChild('editorsListModal') editorsListModal!: IonModal;
  @Input() tournament!: TournamentWithId;
  matches: MatchWithTeams[] = [];
  teams: any[] = [];
  teamPlayers: { [teamId: string]: any[] } = {};
  constants = APP_CONSTANTS;
  isMatchesExpanded = false;

  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<TournamentDeleteEvent>();
  @Output() askEdit = new EventEmitter<EditAccessEvent>();
  @Output() approveEditAccess = new EventEmitter<EditAccessEvent>();
  @Output() removeEditAccess = new EventEmitter<EditAccessEvent>();
  @Output() registerAsPlayer = new EventEmitter<{ tournamentId: string; tournamentName: string }>();
  @Output() toggleRegistration = new EventEmitter<string>();
  @Output() manageTeams = new EventEmitter<string>();

  presentingElement!: HTMLElement | null;

  ngOnInit() {
    this.presentingElement = document.querySelector('.ion-page');
    this.subscribeToMatches();
  }

  subscribeToMatches() {
    this.firestoreService.getMatchesWithTeamsLive(this.tournament.id).subscribe(matches => {
      this.matches = matches;
      this.loadTeamPlayers();
    });
  }

  async loadTeamPlayers() {
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

  onApproveEditAccess(email: string){
    this.approveEditAccess.emit({id: this.tournament.id, tournament: this.tournament, email: email, displayName: '', photoURL: ''});
  }

  onRemoveEditor(email: string) {
    this.removeEditAccess.emit({id: this.tournament.id, tournament: this.tournament, email: email, displayName: '', photoURL: ''});
  }

  authService = inject(AuthService);
  private qrService = inject(QrCodeService);
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);

  get canDelete() {
    return this.authService.hasPermission('admin', this.tournament);
  }

  get canAskEdit() {
    return (
      !!this.authService.user?.email &&
      !this.authService.hasPermission('admin', this.tournament)
    );
  }

  get canEdit() {
    return this.authService.hasPermission('editor', this.tournament);
  }

  get canView() {
    return this.authService.hasPermission('viewer', this.tournament);
  }

  get canRegisterAsPlayer() {
    return (
      !!this.authService.user?.email &&
      this.tournament.registrationOpen
    );
  }

  get canManageRegistration() {
    return this.authService.hasPermission('editor', this.tournament) || this.authService.hasPermission('admin', this.tournament);
  }

  onEdit() {
    this.edit.emit(this.tournament.id);
  }

  onDelete() {
    this.delete.emit({ id: this.tournament.id, name: this.tournament.name });
  }

  onAskEdit() {
    this.askEdit.emit({
      id: this.tournament.id,
      tournament: this.tournament,
      email: this.authService.user?.email!,
      displayName: this.authService.user?.displayName!,
      photoURL: this.authService.user?.photoURL!,
    });
  }

  onPrintQR() {
    this.qrService.printQRCode(this.tournament.id, this.tournament.name);
  }

  openEditorsModal() {
    this.editorsListModal.present();
  }

  getMatchColor(index: number): string {
    return this.constants.CHIP_COLORS[index % this.constants.CHIP_COLORS.length];
  }

  getAvatarUrl(item: any): string {
    return item.photoURL || `${this.constants.ASSETS.PRAVATAR_BASE}${item.email}`;
  }

  getMatchDisplay(match: MatchWithTeams): string {
    if (match.team1Name && match.team2Name) return `${match.team1Name} vs ${match.team2Name}`;
    
    return `Match ${match.id || this.constants.MESSAGES.UNKNOWN}`;
  }

  onMatchClick(matchId: string) {
    this.router.navigate([this.constants.ROUTES.MATCH_CONTROL, matchId], { 
      queryParams: { tournamentId: this.tournament.id } 
    });
  }

  onRegisterAsPlayer() {
    this.registerAsPlayer.emit({
      tournamentId: this.tournament.id,
      tournamentName: this.tournament.name
    });
  }

  onToggleRegistration() {
    this.toggleRegistration.emit(this.tournament.id);
  }

  onManageTeams() {
    this.manageTeams.emit(this.tournament.id);
  }

  // Modern UI Helper Methods
  getTeamInitial(teamName: string): string {
    if (!teamName) return '?';
    return teamName.charAt(0).toUpperCase();
  }

  getShortTeamName(teamName: string): string {
    if (!teamName) return 'Unknown';
    return teamName.length > 8 ? teamName.substring(0, 8) + '...' : teamName;
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'ongoing':
      case 'started':
        return 'status-ongoing';
      case 'scheduled':
      case 'pending':
        return 'status-scheduled';
      case 'completed':
      case 'finished':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-scheduled';
    }
  }

  getStatusText(status: string): string {
    switch (status?.toLowerCase()) {
      case 'ongoing':
      case 'started':
        return 'Live';
      case 'scheduled':
      case 'pending':
        return 'Scheduled';
      case 'completed':
      case 'finished':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Scheduled';
    }
  }

  navigateToScoreboard() {
    this.router.navigate(['/scoreboard', this.tournament.id]);
  }

  navigateToKnockout() {
    this.router.navigate(['/knockout', this.tournament.id]);
  }

  toggleMatches() {
    this.isMatchesExpanded = !this.isMatchesExpanded;
  }

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
}
