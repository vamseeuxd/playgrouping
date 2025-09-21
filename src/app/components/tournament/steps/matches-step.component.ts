import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-matches-step',
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>Schedule Matches</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        @for (match of matches; track match.id) {
        <ion-item>
          <ion-label>
            <h3>{{ match.team1Name }} vs {{ match.team2Name }}</h3>
            <p>{{ match.date | date:'short' }}</p>
            @if (match.court) { <p>Court: {{ match.court }}</p> }
            @if (match.umpire) { <p>Umpire: {{ match.umpire }}</p> }
          </ion-label>
          <ion-button fill="clear" color="primary" (click)="onEditMatch(match)">
            <ion-icon name="create-outline"></ion-icon>
          </ion-button>
          <ion-button fill="clear" color="danger" (click)="onRemoveMatch(match.id)">
            <ion-icon name="trash-outline"></ion-icon>
          </ion-button>
        </ion-item>
        }
        <ion-button expand="block" fill="outline" (click)="onGenerateMatches()">
          Generate Matches
        </ion-button>
        <ion-button expand="block" fill="outline" (click)="onAddMatch()">
          <ion-icon name="add-outline" slot="start"></ion-icon>
          Add Match
        </ion-button>
      </ion-card-content>
    </ion-card>
  `,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton, IonIcon]
})
export class MatchesStepComponent {
  @Input() matches: any[] = [];
  @Output() generateMatches = new EventEmitter<void>();
  @Output() addMatch = new EventEmitter<void>();
  @Output() editMatch = new EventEmitter<any>();
  @Output() removeMatch = new EventEmitter<string>();

  onGenerateMatches() {
    this.generateMatches.emit();
  }

  onAddMatch() {
    this.addMatch.emit();
  }

  onEditMatch(match: any) {
    this.editMatch.emit(match);
  }

  onRemoveMatch(matchId: string) {
    this.removeMatch.emit(matchId);
  }
}