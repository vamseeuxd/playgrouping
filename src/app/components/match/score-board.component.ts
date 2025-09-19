import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonButton, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-score-board',
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>Live Score</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-grid>
          <ion-row>
            <ion-col size="5" class="ion-text-center">
              <h2>{{ team1 }}</h2>
              <h1>{{ score1 }}</h1>
              @if (canEdit) {
              <ion-button size="small" (click)="onScoreChange(1, true)">
                <ion-icon name="add-outline"></ion-icon>
              </ion-button>
              <ion-button size="small" (click)="onScoreChange(1, false)">
                <ion-icon name="remove-outline"></ion-icon>
              </ion-button>
              }
            </ion-col>
            <ion-col size="2" class="ion-text-center">
              <h1>-</h1>
            </ion-col>
            <ion-col size="5" class="ion-text-center">
              <h2>{{ team2 }}</h2>
              <h1>{{ score2 }}</h1>
              @if (canEdit) {
              <ion-button size="small" (click)="onScoreChange(2, true)">
                <ion-icon name="add-outline"></ion-icon>
              </ion-button>
              <ion-button size="small" (click)="onScoreChange(2, false)">
                <ion-icon name="remove-outline"></ion-icon>
              </ion-button>
              }
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-card-content>
    </ion-card>
  `,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonButton, IonIcon]
})
export class ScoreBoardComponent {
  @Input() team1 = '';
  @Input() team2 = '';
  @Input() score1 = 0;
  @Input() score2 = 0;
  @Input() canEdit = false;
  @Output() scoreChange = new EventEmitter<{team: number, increment: boolean}>();

  onScoreChange(team: number, increment: boolean) {
    this.scoreChange.emit({team, increment});
  }
}