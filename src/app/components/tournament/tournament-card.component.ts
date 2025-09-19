import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { IonItem, IonLabel, IonButton, IonIcon } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { QrCodeService } from '../../services/qr-code.service';

@Component({
  selector: 'app-tournament-card',
  template: `
    <ion-item>
      <ion-icon name="trophy-outline" slot="start"></ion-icon>
      <ion-label>
        <h2>{{ tournament.name }}</h2>
        <p>Sport: {{ tournament.sport }}</p>
        <p>Start Date: {{ tournament.startDate | date:'short' }}</p>
      </ion-label>
      @if (canView) {
        <ion-button fill="clear" slot="end" [routerLink]="'/scoreboard/' + tournament.id">
          <ion-icon name="stats-chart-outline"></ion-icon>
        </ion-button>
      }
      @if (canEdit) {
        <ion-button fill="clear" slot="end" [routerLink]="'/knockout/' + tournament.id">
          <ion-icon name="trophy-outline"></ion-icon>
        </ion-button>
        <ion-button fill="clear" slot="end" (click)="onEdit()">
          <ion-icon name="settings-outline"></ion-icon>
        </ion-button>
        <ion-button fill="clear" slot="end" color="primary" (click)="onPrintQR()">
          <ion-icon name="qr-code-outline"></ion-icon>
        </ion-button>
      }
      @if (canDelete) {
      <ion-button fill="clear" slot="end" color="danger" (click)="onDelete()">
        <ion-icon name="trash-outline"></ion-icon>
      </ion-button>
      }
    </ion-item>
  `,
  imports: [CommonModule, RouterLink, IonItem, IonLabel, IonButton, IonIcon]
})
export class TournamentCardComponent {
  @Input() tournament: any;
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<{id: string, name: string}>();

  private authService = inject(AuthService);
  private qrService = inject(QrCodeService);

  get canDelete() {
    return this.authService.hasPermission('admin', this.tournament);
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
    this.delete.emit({id: this.tournament.id, name: this.tournament.name});
  }

  onPrintQR() {
    this.qrService.printQRCode(this.tournament.id, this.tournament.name);
  }
}
