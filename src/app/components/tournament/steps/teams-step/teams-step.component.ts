import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-teams-step',
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>Teams</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        @for (team of teams; track team.id) {
        <ion-item>
          <ion-label>
            <h3>{{ team.name }}</h3>
            <p>Players: {{ team.players?.length || 0 }}</p>
          </ion-label>
          <ion-button fill="clear" color="primary" (click)="onEditTeam(team)">
            <ion-icon name="create-outline"></ion-icon>
          </ion-button>
          <ion-button fill="clear" color="danger" (click)="onRemoveTeam(team.id)">
            <ion-icon name="trash-outline"></ion-icon>
          </ion-button>
        </ion-item>
        }
        <ion-button expand="block" fill="outline" (click)="onAddTeam()">
          <ion-icon name="add-outline" slot="start"></ion-icon>
          Add Team
        </ion-button>
      </ion-card-content>
    </ion-card>
  `,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton, IonIcon]
})
export class TeamsStepComponent {
  @Input() teams: any[] = [];
  @Output() addTeam = new EventEmitter<void>();
  @Output() editTeam = new EventEmitter<any>();
  @Output() removeTeam = new EventEmitter<string>();

  onAddTeam() {
    this.addTeam.emit();
  }

  onEditTeam(team: any) {
    this.editTeam.emit(team);
  }

  onRemoveTeam(teamId: string) {
    this.removeTeam.emit(teamId);
  }
}
