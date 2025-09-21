import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonCardSubtitle, IonItem, IonLabel, IonList } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { TeamPlayerWithUser } from '../../interfaces';

@Component({
  selector: 'app-score-board',
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>Live Score</ion-card-title>
        <ion-card-subtitle>{{ team1 }} vs {{ team2 }} ( Status: {{ status | titlecase }} )</ion-card-subtitle>
      </ion-card-header>
      <ion-card-content>
        <ion-grid>
          <ion-row>
            <ion-col size="5" class="ion-text-center" style="border-right: 1px solid #ccc;">
              <div style=" display: flex; flex-direction: column; align-content: center; align-items: center; justify-content: center; ">
                <ion-icon size="large" name="people-circle-outline"></ion-icon>
                  <h3><b>{{ team1 }}</b></h3>
                  <h1><b>{{ score1 }}</b></h1>
              </div>
              @if (team1Players && team1Players.length > 0) {
                @for (player of team1Players; track player.id) {
                  <ion-card>
                    <ion-card-content>
                     <div style=" display: flex; flex-direction: row; align-content: center; align-items: center; justify-content: center; ">
                        <ion-icon size="small" name="person-outline" style="font-size: 24px;"></ion-icon> &nbsp;
                        <b>{{ player?.name || 'Unknown' }}</b>
                      </div>
                      @if (canEdit) {
                        <ion-button size="small" (click)="onPlayerScoreChange(1, player.id!, true)">
                          <ion-icon name="add-outline"></ion-icon>
                        </ion-button>
                        <p>Score: {{ player?.score || 0 }}</p>
                        <ion-button size="small" (click)="onPlayerScoreChange(1, player.id!, false)">
                          <ion-icon name="remove-outline"></ion-icon>
                        </ion-button>
                      }
                    </ion-card-content>
                  </ion-card>
                }
              } @else {
                <p>No players found for {{ team1 }}</p>
              }
            </ion-col>
            <ion-col size="2" class="ion-text-center" style="display: flex; align-items: center; justify-content: center;">
              <img  src="../../../assets/vs.png" alt="vs" style="max-width: 50px; margin-top: 40px;"/>
            </ion-col>
            <ion-col size="5" class="ion-text-center" style="border-left: 1px solid #ccc;">
              <div style=" display: flex; flex-direction: column; align-content: center; align-items: center; justify-content: center; ">
                <ion-icon size="large" name="people-circle-outline"></ion-icon>
                  <h3><b>{{ team2 }}</b></h3>
                  <h1><b>{{ score2 }}</b></h1>
              </div>
              @if (team2Players && team2Players.length > 0) {
                @for (player of team2Players; track player.id) {
                  <ion-card>
                    <ion-card-content>
                      <div style=" display: flex; flex-direction: row; align-content: center; align-items: center; justify-content: center; ">
                        <ion-icon size="small" name="person-outline" style="font-size: 24px;"></ion-icon> &nbsp;
                        <b>{{ player?.name || 'Unknown' }}</b>
                      </div>
                      @if (canEdit) {
                        <ion-button size="small" (click)="onPlayerScoreChange(2, player.id!, true)">
                          <ion-icon name="add-outline"></ion-icon>
                        </ion-button>
                        <p>Score: {{ player?.score || 0 }}</p>
                        <ion-button size="small" (click)="onPlayerScoreChange(2, player.id!, false)">
                          <ion-icon name="remove-outline"></ion-icon>
                        </ion-button>
                      }
                    </ion-card-content>
                  </ion-card>
                }
              } @else {
                <p>Team2 Players Count: {{ team2Players.length || 0 }}</p>
              <p>No players found for {{ team2 }}</p>
              }
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-card-content>
    </ion-card>
  `,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonGrid, IonRow, IonCol, IonButton, IonIcon]
})
export class ScoreBoardComponent {
  @Input() team1 = '';
  @Input() team2 = '';
  @Input() status = '';
  @Input() score1 = 0;
  @Input() score2 = 0;
  @Input() canEdit = false;
  @Input() team1Players: TeamPlayerWithUser[] = [];
  @Input() team2Players: TeamPlayerWithUser[] = [];
  @Output() scoreChange = new EventEmitter<{team: number, increment: boolean}>();
  @Output() playerScoreChange = new EventEmitter<{team: number, playerId: string, increment: boolean}>();

  ngOnInit() {
    console.log('ScoreBoard - team1Players:', this.team1Players);
    console.log('ScoreBoard - team2Players:', this.team2Players);
  }

  onScoreChange(team: number, increment: boolean) {
    this.scoreChange.emit({team, increment});
  }

  onPlayerScoreChange(team: number, playerId: string, increment: boolean) {
    this.playerScoreChange.emit({team, playerId, increment});
  }
}