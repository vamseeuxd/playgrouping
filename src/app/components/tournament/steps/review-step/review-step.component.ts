import { Component, Input } from '@angular/core';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-review-step',
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>Review & Submit</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-item>
          <ion-label>
            <h3>Tournament: {{ tournament.name }}</h3>
            <p>Sport: {{ tournament.sport }}</p>
            <p>Start Date: {{ tournament.startDate | date:'short' }}</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <h3>Players: {{ playersCount }}</h3>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <h3>Teams: {{ teamsCount }}</h3>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <h3>Matches: {{ matchesCount }}</h3>
          </ion-label>
        </ion-item>
      </ion-card-content>
    </ion-card>
  `,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel]
})
export class ReviewStepComponent {
  @Input() tournament: any = {};
  @Input() playersCount = 0;
  @Input() teamsCount = 0;
  @Input() matchesCount = 0;
}