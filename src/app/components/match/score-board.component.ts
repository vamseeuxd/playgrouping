import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonCardSubtitle,
  IonLabel,
  IonAvatar,
  IonChip,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { MatchPlayerWithUser } from '../../interfaces';

@Component({
  selector: 'app-score-board',
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-subtitle>{{ team1 }} vs {{ team2 }}</ion-card-subtitle>
      </ion-card-header>
      <ion-card-content>
        <ion-grid>
          <ion-row>
            <ion-col
              size="12"
              class="ion-text-center"
              style="border: 1px solid #ccc;"
            >
              <div
                style="display: flex; flex-direction: row; align-content: center; align-items: center; justify-content: space-between; "
              >
                <h3>
                  <b>Team {{ team1 }} </b>
                </h3>
                <h2>
                  <b>Score {{ score1 }}</b>
                </h2>
              </div>
              @if (team1Players && team1Players.length > 0) { @for (player of
              team1Players; track player.userId) {
              <ion-card>
                <ion-card-content>
                  <div
                    style="display: flex; flex-direction: row; align-content: center; align-items: center; justify-content: space-between; "
                  >
                    <ion-chip>
                      <ion-avatar>
                        <img
                          src="{{
                            player?.photoURL ||
                              '../../../assets/default-avatar.png'
                          }}"
                          alt=""
                        />
                      </ion-avatar>
                      <ion-label>{{ player?.name || 'Unknown' }}</ion-label>
                    </ion-chip>
                    @if (!canEdit) {
                    <h1 style="margin: 0 20px;">{{ player?.score || 0 }}</h1>
                    }
                  </div>
                  @if (canEdit) {
                  <div
                    style=" display: flex; flex-direction: row; align-content: center; align-items: center; justify-content: center; "
                  >
                    <ion-button
                      size="small"
                      (click)="onPlayerScoreChange(1, player.userId, true)"
                    >
                      <ion-icon name="add-outline"></ion-icon>
                    </ion-button>
                    <h1 style="margin: 0 20px;">{{ player?.score || 0 }}</h1>
                    <ion-button
                      size="small"
                      (click)="onPlayerScoreChange(1, player.userId, false)"
                    >
                      <ion-icon name="remove-outline"></ion-icon>
                    </ion-button>
                  </div>
                  }
                </ion-card-content>
              </ion-card>
              } } @else {
              <p>No players found for {{ team1 }}</p>
              }
            </ion-col>
            <ion-col
              size="12"
              class="ion-text-center"
              style="display: flex; align-items: center; justify-content: center;"
            >
              <img
                src="../../../assets/vs.png"
                alt="vs"
                style="max-width: 50px; margin-top: 10px;"
              />
            </ion-col>
            <ion-col
              size="12"
              class="ion-text-center"
              style="border: 1px solid #ccc;"
            >
              <div
                style=" display: flex; flex-direction: row; align-content: center; align-items: center; justify-content: space-between; "
              >
                <h3>
                  <b>Team {{ team2 }} </b>
                </h3>
                <h2>
                  <b>Score {{ score2 }}</b>
                </h2>
              </div>
              @if (team2Players && team2Players.length > 0) { @for (player of
              team2Players; track player.userId) {
              <ion-card>
                <ion-card-content>
                  <div
                    style="display: flex; flex-direction: row; align-content: center; align-items: center; justify-content: space-between; "
                  >
                    <ion-chip>
                      <ion-avatar>
                        <img
                          src="{{
                            player?.photoURL ||
                              '../../../assets/default-avatar.png'
                          }}"
                          alt=""
                        />
                      </ion-avatar>
                      <ion-label>{{ player?.name || 'Unknown' }}</ion-label>
                    </ion-chip>
                    @if (!canEdit) {
                    <h1 style="margin: 0 20px;">{{ player?.score || 0 }}</h1>
                    }
                  </div>

                  @if (canEdit) {
                  <div
                    style=" display: flex; flex-direction: row; align-content: center; align-items: center; justify-content: center; "
                  >
                    <ion-button
                      size="small"
                      (click)="onPlayerScoreChange(2, player.userId, true)"
                    >
                      <ion-icon name="add-outline"></ion-icon>
                    </ion-button>
                    <h1 style="margin: 0 20px;">{{ player?.score || 0 }}</h1>
                    <ion-button
                      size="small"
                      (click)="onPlayerScoreChange(2, player.userId, false)"
                    >
                      <ion-icon name="remove-outline"></ion-icon>
                    </ion-button>
                  </div>
                  }
                </ion-card-content>
              </ion-card>
              } } @else {
              <p>Team2 Players Count: {{ team2Players.length || 0 }}</p>
              <p>No players found for {{ team2 }}</p>
              }
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-card-content>
    </ion-card>
  `,
  imports: [
    CommonModule,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
    IonAvatar,
    IonChip,
    IonLabel,
  ],
})
export class ScoreBoardComponent {
  @Input() team1 = '';
  @Input() team2 = '';
  @Input() status = '';
  @Input() score1 = 0;
  @Input() score2 = 0;
  @Input() canEdit = false;
  @Input() team1Players: MatchPlayerWithUser[] = [];
  @Input() team2Players: MatchPlayerWithUser[] = [];
  @Output() scoreChange = new EventEmitter<{
    team: number;
    increment: boolean;
  }>();
  @Output() playerScoreChange = new EventEmitter<{
    team: number;
    playerId: string;
    increment: boolean;
  }>();

  ngOnInit() {
    console.log('ScoreBoard - team1Players:', this.team1Players);
    console.log('ScoreBoard - team2Players:', this.team2Players);
  }

  onScoreChange(team: number, increment: boolean) {
    this.scoreChange.emit({ team, increment });
  }

  onPlayerScoreChange(team: number, playerId: string, increment: boolean) {
    this.playerScoreChange.emit({ team, playerId, increment });
  }
}
