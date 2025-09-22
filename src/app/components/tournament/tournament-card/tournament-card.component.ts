import { Component, Input, Output, EventEmitter, inject, ViewChild } from '@angular/core';
import { IonItem, IonLabel, IonButton, IonIcon, IonContent, IonAvatar, IonImg, IonList, IonModal, IonHeader, IonToolbar, IonTitle, IonPopover, IonItemSliding, IonItemOptions, IonItemOption, IonChip, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { QrCodeService } from '../../../services/qr-code.service';
import { FirestoreService } from '../../../services/firestore.service';
import { TournamentWithId, Match, MatchWithTeams, EditAccessEvent, TournamentDeleteEvent } from '../../../interfaces';
import { APP_CONSTANTS } from '../../../constants/app.constants';
import { TOURNAMENT_CARD_CONSTANTS } from '../../../constants/tournament-card.constants';

@Component({
  selector: 'app-tournament-card',
  template: `        
    <ion-card [style]="constants.STYLES.ITEM">        
        <ion-card-content>
        <p style="font-size: 1.2rem;font-weight: bold;">{{ tournament.name }}</p>
        <p style="font-size: 0.9rem;">Sport: {{ tournament.sport }}</p>
        <p style="font-size: 0.9rem;">Start Date: {{ tournament.startDate | date : 'short' }}</p>
        <div style="margin-top: 8px;border: 1px solid #ccc; padding: 8px;">
          <p style="font-size: 1rem;font-weight: bold;border-bottom: 1px solid #ccc;padding-bottom: 4px;margin: 0 4px 4px 4px;">Matches: {{ matches.length }}</p>
          @if (matches.length > 0) {
            <div [style]="constants.STYLES.CHIPS_CONTAINER + 'padding-bottom: 8px;'">
              @for (match of matches; track $index) {
                <ion-chip [color]="getMatchColor($index)" [style]="constants.STYLES.CHIP" (click)="onMatchClick(match.id!)">{{ getMatchDisplay(match) }}</ion-chip>
              }
            </div>
          }
        </div>
      </ion-card-content>
      <!-- ********************************** Editors List Modal Popover ********************************** -->
      <ion-button
        id="click-trigger-{{tournament.id}}"
        color="medium"
        fill="clear"
        size="large"
        [style]="constants.STYLES.BUTTON"
        ><ion-icon [name]="constants.ICONS.MENU"></ion-icon
      ></ion-button>
      <ion-popover trigger="click-trigger-{{tournament.id}}" [dismissOnSelect]="true">
        <ng-template>
          <ion-content>
            <ion-list mode="ios">
              @if (canView) {
              <ion-item
                [button]="true"
                [routerLink]="'/scoreboard/' + tournament.id"
              >
                <ion-icon slot="start" [name]="constants.ICONS.STATS"></ion-icon>
                <ion-label> Scoreboard </ion-label>
              </ion-item>
              <ion-item
                [button]="true"
                [routerLink]="'/knockout/' + tournament.id"
              >
                <ion-icon slot="start" [name]="constants.ICONS.TROPHY"></ion-icon>
                <ion-label> Knockout </ion-label>
              </ion-item>
              } @if (canEdit) {
              <ion-item [button]="true" (click)="onEdit()">
                <ion-icon slot="start" [name]="constants.ICONS.SETTINGS"></ion-icon>
                <ion-label> Edit </ion-label>
              </ion-item>
              <ion-item [button]="true" (click)="onPrintQR()">
                <ion-icon slot="start" [name]="constants.ICONS.QR_CODE"></ion-icon>
                <ion-label>Print QR </ion-label>
              </ion-item>
              } @if (canDelete) {
              <ion-item [button]="true" (click)="onDelete()">
                <ion-icon slot="start" [name]="constants.ICONS.TRASH"></ion-icon>
                <ion-label> Delete </ion-label>
              </ion-item>
              <ion-item [button]="true" (click)="openEditorsModal()">
                <ion-icon slot="start" [name]="constants.ICONS.LIST"></ion-icon>
                <ion-label> Editors List </ion-label>
              </ion-item>
              } @if (canAskEdit) {
              <ion-item [button]="true" (click)="onAskEdit()">
                <ion-icon slot="start" [name]="constants.ICONS.ALBUMS"></ion-icon>
                <ion-label> Ask Edit </ion-label>
              </ion-item>
              } @if (canRegisterAsPlayer) {
              <ion-item [button]="true" (click)="onRegisterAsPlayer()">
                <ion-icon slot="start" name="person-add-outline"></ion-icon>
                <ion-label> Register as Player </ion-label>
              </ion-item>
              } @if (canManageRegistration) {
              <ion-item [button]="true" (click)="onToggleRegistration()">
                <ion-icon slot="start" name="{{ tournament.registrationOpen ? 'lock-closed-outline' : 'lock-open-outline' }}"></ion-icon>
                <ion-label> {{ tournament.registrationOpen ? 'Close' : 'Open' }} Registration </ion-label>
              </ion-item>
              <ion-item [button]="true" (click)="onManageTeams()">
                <ion-icon slot="start" name="people-outline"></ion-icon>
                <ion-label> Manage Teams </ion-label>
              </ion-item>
              }
            </ion-list>

          </ion-content>
        </ng-template>
      </ion-popover>
      <!-- ********************************** Editors List Modal Popover ********************************** -->
    </ion-card>      
    <ion-modal #editorsListModal mode="ios" [presentingElement]="presentingElement">
      <ng-template>
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>Editors List</ion-title>
            <!-- <ion-buttons slot="end">
              <ion-button expandable (click)="editorsListModalOpen = false">Close</ion-button>
            </ion-buttons> -->
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list>
            @if (tournament.editors.length === 0) {
            <ion-item>
              <ion-label>No editors assigned.</ion-label>
            </ion-item>
            } @else {
              @for (item of tournament.editors; track $index) { 
                 <ion-item-sliding>
                   <ion-item>
                     <ion-avatar slot="start">
                       <ion-img [src]="getAvatarUrl(item)"></ion-img>
                     </ion-avatar>
                     <ion-label> 
                       <h2>{{ item.displayName }}</h2>
                       <p>{{ item.email }}</p>
                     </ion-label>
                   </ion-item>
                   <ion-item-options side="end">
                       @if (item.email !== authService.user?.email) {
                        <ion-item-option [disabled]="item.approved" (click)="onApproveEditAccess(item.email)">Approve</ion-item-option>
                        <ion-item-option (click)="onRemoveEditor(item.email)">Remove</ion-item-option>
                      }
                     </ion-item-options>
                 </ion-item-sliding>
              }
            }
          </ion-list>
        </ion-content>
      </ng-template>
    </ion-modal>
  `,
  imports: [
    CommonModule,
    RouterLink,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonAvatar,
    IonContent,
    IonHeader,
    IonImg,
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
    IonCardContent
],
})
export class TournamentCardComponent {
  @ViewChild('editorsListModal') editorsListModal!: IonModal;
  @Input() tournament!: TournamentWithId;
  matches: MatchWithTeams[] = [];
  constants = APP_CONSTANTS;
  tournamentConstants = TOURNAMENT_CARD_CONSTANTS;
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
    this.loadMatches();
  }

  async loadMatches() {
    this.matches = await this.firestoreService.getMatchesWithTeams(this.tournament.id);
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
    const { TEAM1, TEAM2, TEAM_A, TEAM_B, HOME_TEAM, AWAY_TEAM } = this.tournamentConstants.MATCH_PROPERTIES;
    
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
}
