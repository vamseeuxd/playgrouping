import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { IonItem, IonLabel, IonButton, IonIcon, IonContent, IonAvatar, IonImg, IonList, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonPopover, IonItemSliding, IonItemOptions, IonItemOption } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { QrCodeService } from '../../services/qr-code.service';

@Component({
  selector: 'app-tournament-card',
  template: `
    <ion-item>
      <!-- <ion-icon name="trophy-outline" slot="start"></ion-icon> -->
      <ion-label>
        <h2>{{ tournament.name }}</h2>
        <p>Sport: {{ tournament.sport }}</p>
        <p>Start Date: {{ tournament.startDate | date : 'short' }}</p>
      </ion-label>
      <ion-button
        id="click-trigger"
        color="medium"
        slot="end"
        fill="clear"
        size="large"
        ><ion-icon name="grid-outline"></ion-icon
      ></ion-button>
      <ion-popover trigger="click-trigger" [dismissOnSelect]="true" mode="ios">
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
              <ion-item [button]="true" id="openEditorsListModal" (click)="editorsListModalOpen = true">
                <ion-icon slot="start" name="list-outline"></ion-icon>
                <ion-label> Editors List </ion-label>
              </ion-item>

              <ion-modal #editorsListModal mode="ios" [isOpen]="editorsListModalOpen" [presentingElement]="presentingElement">
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
                      @if (tournament.editors?.length === 0) {
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
                                  <ion-item-option expandable [disabled]="item.approved" (click)="onApproveEditAccess(item.email)">Approve</ion-item-option>
                                  <ion-item-option expandable (click)="onRemoveEditor(item.email)">Remove</ion-item-option>
                                }
                               </ion-item-options>
                           </ion-item-sliding>
                        }
                      }
                    </ion-list>
                  </ion-content>
                </ng-template>
              </ion-modal>
              } @if (canAskEdit) {
              <ion-item [button]="true" (click)="onAskEdit()">
                <ion-icon slot="start" name="albums-outline"></ion-icon>
                <ion-label> Ask Edit </ion-label>
              </ion-item>
              }
            </ion-list>
          </ion-content>
        </ng-template>
      </ion-popover>     
    </ion-item>
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
    IonItemOption
],
})
export class TournamentCardComponent {
  editorsListModalOpen = false;
  @Input() tournament: any;
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<{ id: string; name: string }>();
  @Output() askEdit = new EventEmitter<{
    id: string;
    tournament: any;
    email: string;
    displayName: string;
    photoURL: string;
  }>();
  @Output() approveEditAccess = new EventEmitter<{
    id: string, tournament: any, email: string
  }>();
  @Output() removeEditAccess = new EventEmitter<{
    id: string, tournament: any, email: string
  }>();

  presentingElement!: HTMLElement | null;

  ngOnInit() {
    this.presentingElement = document.querySelector('.ion-page');
  }

  onApproveEditAccess(email: string){
    this.approveEditAccess.emit({id: this.tournament.id, tournament: this.tournament, email: email});
  }

  onRemoveEditor(email: string) {
    this.removeEditAccess.emit({id: this.tournament.id, tournament: this.tournament, email: email});
  }

  authService = inject(AuthService);
  qrService = inject(QrCodeService);

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
}
