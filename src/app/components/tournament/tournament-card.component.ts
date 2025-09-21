import { Component, Input, Output, EventEmitter, inject, ViewChild } from '@angular/core';
import { IonItem, IonLabel, IonButton, IonIcon, IonContent, IonAvatar, IonImg, IonList, IonModal, IonHeader, IonToolbar, IonTitle, IonPopover, IonItemSliding, IonItemOptions, IonItemOption, IonChip, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { QrCodeService } from '../../services/qr-code.service';
import { FirestoreService } from '../../services/firestore.service';
import { TournamentWithId, Match, EditAccessEvent, TournamentDeleteEvent } from '../../interfaces';

@Component({
  selector: 'app-tournament-card',
  template: `        
    <ion-card style="position: relative;">        
        <ion-card-content>
        <p style="font-size: 1.2rem;font-weight: bold;">{{ tournament.name }}</p>
        <p style="font-size: 0.9rem;">Sport: {{ tournament.sport }}</p>
        <p style="font-size: 0.9rem;">Start Date: {{ tournament.startDate | date : 'short' }}</p>
        <div style="margin-top: 8px;border: 1px solid #ccc; padding: 8px;">
          <p style="font-size: 1rem;font-weight: bold;border-bottom: 1px solid #ccc;padding-bottom: 4px;margin: 0 4px 4px 4px;">Matches: {{ matches.length }}</p>
          @if (matches.length > 0) {
            <div style="display: flex; overflow-x: auto; gap: 4px; white-space: nowrap;padding-bottom: 8px;">
              @for (match of matches; track $index) {
                <ion-chip [color]="getMatchColor($index)" style="flex-shrink: 0;" (click)="onMatchClick(match.id!)">{{ getMatchDisplay(match) }}</ion-chip>
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
        style="position: absolute; top: 8px; right: 8px; z-index: 10;"
        ><ion-icon name="ellipsis-vertical-outline"></ion-icon
      ></ion-button>
      <ion-popover trigger="click-trigger-{{tournament.id}}" [dismissOnSelect]="true" mode="ios">
        <ng-template>
          <ion-content>
            <ion-list mode="ios">
              @if (canView) {
              <ion-item
                [button]="true"
                [routerLink]="'/scoreboard/' + tournament.id"
              >
                <ion-icon slot="start" name="stats-chart-outline"></ion-icon>
                <ion-label> Scoreboard </ion-label>
              </ion-item>
              <ion-item
                [button]="true"
                [routerLink]="'/knockout/' + tournament.id"
              >
                <ion-icon slot="start" name="trophy-outline"></ion-icon>
                <ion-label> Knockout </ion-label>
              </ion-item>
              } @if (canEdit) {
              <ion-item [button]="true" (click)="onEdit()">
                <ion-icon slot="start" name="settings-outline"></ion-icon>
                <ion-label> Edit </ion-label>
              </ion-item>
              <ion-item [button]="true" (click)="onPrintQR()">
                <ion-icon slot="start" name="qr-code-outline"></ion-icon>
                <ion-label>Print QR </ion-label>
              </ion-item>
              } @if (canDelete) {
              <ion-item [button]="true" (click)="onDelete()">
                <ion-icon slot="start" name="trash-outline"></ion-icon>
                <ion-label> Delete </ion-label>
              </ion-item>
              <ion-item [button]="true" (click)="openEditorsModal()">
                <ion-icon slot="start" name="list-outline"></ion-icon>
                <ion-label> Editors List </ion-label>
              </ion-item>
              } @if (canAskEdit) {
              <ion-item [button]="true" (click)="onAskEdit()">
                <ion-icon slot="start" name="albums-outline"></ion-icon>
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
                       <ion-img [src]="item.photoURL || 'https://i.pravatar.cc/300?u=' + item.email"></ion-img>
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
    IonItem,
    IonLabel,
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
  editorsListModalOpen = false;
  @Input() tournament!: TournamentWithId;
  matches: Match[] = [];
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

  loadMatches() {
    this.firestoreService.getMatches(this.tournament.id).subscribe(matches => {
      this.matches = matches;
    });
  }

  onApproveEditAccess(email: string){
    this.approveEditAccess.emit({id: this.tournament.id, tournament: this.tournament, email: email, displayName: '', photoURL: ''});
  }

  onRemoveEditor(email: string) {
    this.removeEditAccess.emit({id: this.tournament.id, tournament: this.tournament, email: email, displayName: '', photoURL: ''});
  }

  authService = inject(AuthService);
  qrService = inject(QrCodeService);
  firestoreService = inject(FirestoreService);
  router = inject(Router);

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
      this.tournament.registrationOpen &&
      !this.authService.hasPermission('admin', this.tournament)
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
    const colors = ['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'medium', 'dark'];
    return colors[index % colors.length];
  }

  getMatchDisplay(match: Match): string {
    return match.team1 && match.team2 ? `${match.team1} vs ${match.team2}` : 
           `Match ${match.id || 'Unknown'}`;
  }

  onMatchClick(matchId: string) {
    this.router.navigate(['/match-control', matchId], { queryParams: { tournamentId: this.tournament.id } });
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
