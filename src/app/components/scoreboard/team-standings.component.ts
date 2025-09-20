import { Component, Input } from '@angular/core';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-team-standings',
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>Team Standings</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        @for (stat of teamStats; track stat.team; let i = $index) {
        <ion-item class="team-item">
          <ion-label>
            <div class="team-header">
              <span class="position">{{ i + 1 }}</span>
              <h2>{{ stat.team }}</h2>
              <span class="points">{{ stat.points }} pts</span>
            </div>
            <div class="team-stats">
              <div class="stat-item">
                <span class="stat-label">Played</span>
                <span class="stat-value">{{ stat.played }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Won</span>
                <span class="stat-value">{{ stat.won }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Drawn</span>
                <span class="stat-value">{{ stat.drawn }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Lost</span>
                <span class="stat-value">{{ stat.lost }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Goals For</span>
                <span class="stat-value">{{ stat.goalsFor }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Goals Against</span>
                <span class="stat-value">{{ stat.goalsAgainst }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Goal Diff</span>
                <span class="stat-value">{{ stat.goalDifference >= 0 ? '+' : '' }}{{ stat.goalDifference }}</span>
              </div>
            </div>
          </ion-label>
        </ion-item>
        }
      </ion-card-content>
    </ion-card>
  `,
  styles: [`
    .team-item {
      --padding-start: 16px;
      --padding-end: 16px;
      margin-bottom: 8px;
    }

    .team-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .position {
      background: var(--ion-color-primary);
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.9rem;
    }

    .points {
      background: var(--ion-color-success);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-weight: bold;
      font-size: 0.9rem;
    }

    .team-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
      gap: 8px;
      margin-top: 8px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      border: 1px solid #0054e9;
    }

    .stat-label {
      font-size: 0.7rem;
      color: var(--ion-color-medium);
      margin-bottom: 2px;
    }

    .stat-value {
      font-weight: bold;
      font-size: 0.9rem;
      color: var(--ion-color-dark);
    }
  `],
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel]
})
export class TeamStandingsComponent {
  @Input() teamStats: any[] = [];
}