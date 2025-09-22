import { Component, Input } from '@angular/core';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

interface PlayerStats {
  name: string;
  team: string;
  played: number;
  goals: number;
  averageGoals: number;
}

@Component({
  selector: 'app-player-standings',
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>Player Statistics</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        @if (playerStats.length === 0) {
          <ion-item>
            <ion-label>No player statistics available</ion-label>
          </ion-item>
        } @else {
          <ion-grid>
            <ion-row class="header-row">
              <ion-col size="1"><strong>#</strong></ion-col>
              <ion-col size="4"><strong>Player</strong></ion-col>
              <ion-col size="3"><strong>Team</strong></ion-col>
              <ion-col size="2"><strong>Goals</strong></ion-col>
              <ion-col size="2"><strong>Avg</strong></ion-col>
            </ion-row>
            @for (player of playerStats; track $index) {
              <ion-row>
                <ion-col size="1">{{ $index + 1 }}</ion-col>
                <ion-col size="4">{{ player.name }}</ion-col>
                <ion-col size="3">{{ player.team }}</ion-col>
                <ion-col size="2">{{ player.goals }}</ion-col>
                <ion-col size="2">{{ player.averageGoals.toFixed(1) }}</ion-col>
              </ion-row>
            }
          </ion-grid>
        }
      </ion-card-content>
    </ion-card>
  `,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonGrid, IonRow, IonCol],
  styles: [`
    .header-row {
      border-bottom: 1px solid var(--ion-color-medium);
      margin-bottom: 8px;
    }
    ion-row {
      align-items: center;
      min-height: 40px;
    }
  `]
})
export class PlayerStandingsComponent {
  @Input() playerStats: PlayerStats[] = [];
}