import { Component, inject } from '@angular/core';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ROLES } from '../../constants/roles.constants';
import { addIcons } from 'ionicons';
import { shieldOutline, createOutline, eyeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-role-selector',
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>Access Level</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-button
          expand="block"
          fill="outline"
          color="danger"
          (click)="setAdmin()"
          class="ion-margin-bottom">
          <ion-icon name="shield-outline" slot="start"></ion-icon>
          Admin Access
        </ion-button>

        <ion-button
          expand="block"
          fill="outline"
          color="warning"
          (click)="setEdit()"
          class="ion-margin-bottom">
          <ion-icon name="create-outline" slot="start"></ion-icon>
          Edit Access
        </ion-button>

        <ion-button
          expand="block"
          fill="outline"
          color="medium"
          (click)="setView()">
          <ion-icon name="eye-outline" slot="start"></ion-icon>
          View Only Access
        </ion-button>
      </ion-card-content>
    </ion-card>
  `,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon]
})
export class RoleSelectorComponent {
  private authService = inject(AuthService);

  constructor() {
    addIcons({ shieldOutline, createOutline, eyeOutline });
  }

  setAdmin() {
    this.authService.setAdminAccess();
  }

  setEdit() {
    this.authService.setEditAccess();
  }

  setView() {
    // For demo, set view access to first tournament
    this.authService.setViewAccess('demo-tournament');
  }
}
