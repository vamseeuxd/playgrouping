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
import { APP_CONSTANTS } from '../../constants/app.constants';

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
              [style]="constants.STYLES.BORDER"
            >
              <div [style]="constants.STYLES.FLEX_ROW_BETWEEN">
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
                  <div [style]="constants.STYLES.FLEX_ROW_BETWEEN">
                    <ion-chip>
                      <ion-avatar>
                        <img [src]="getPlayerAvatar(player)" alt="" />
                      </ion-avatar>
                      <ion-label>{{ player?.name || constants.MESSAGES.UNKNOWN }}</ion-label>
                    </ion-chip>
                    @if (!canEdit) {
                    <h1 [style]="constants.STYLES.MARGIN_SIDES">{{ player?.score || 0 }}</h1>
                    }
                  </div>
                  @if (canEdit) {
                  <div [style]="constants.STYLES.FLEX_ROW_CENTER">
                    <ion-button
                      size="small"
                      (click)="onPlayerScoreChange(1, player.userId, true)"
                    >
                      <ion-icon [name]="constants.ICONS.ADD"></ion-icon>
                    </ion-button>
                    <h1 [style]="constants.STYLES.MARGIN_SIDES">{{ player?.score || 0 }}</h1>
                    <ion-button
                      size="small"
                      (click)="onPlayerScoreChange(1, player.userId, false)"
                    >
                      <ion-icon [name]="constants.ICONS.REMOVE"></ion-icon>
                    </ion-button>
                  </div>
                  }
                </ion-card-content>
              </ion-card>
              } } @else {
              <p>{{ constants.MESSAGES.NO_PLAYERS_FOUND }} {{ team1 }}</p>
              }
            </ion-col>
            <ion-col
              size="12"
              class="ion-text-center"
              [style]="constants.STYLES.FLEX_CENTER"
            >
              <img
                [src]="constants.ASSETS.VS_IMAGE"
                alt="vs"
                [style]="constants.STYLES.MAX_WIDTH_50"
              />
            </ion-col>
            <ion-col
              size="12"
              class="ion-text-center"
              [style]="constants.STYLES.BORDER"
            >
              <div [style]="constants.STYLES.FLEX_ROW_BETWEEN">
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
                  <div [style]="constants.STYLES.FLEX_ROW_BETWEEN">
                    <ion-chip>
                      <ion-avatar>
                        <img [src]="getPlayerAvatar(player)" alt="" />
                      </ion-avatar>
                      <ion-label>{{ player?.name || constants.MESSAGES.UNKNOWN }}</ion-label>
                    </ion-chip>
                    @if (!canEdit) {
                    <h1 [style]="constants.STYLES.MARGIN_SIDES">{{ player?.score || 0 }}</h1>
                    }
                  </div>

                  @if (canEdit) {
                  <div [style]="constants.STYLES.FLEX_ROW_CENTER">
                    <ion-button
                      size="small"
                      (click)="onPlayerScoreChange(2, player.userId, true)"
                    >
                      <ion-icon [name]="constants.ICONS.ADD"></ion-icon>
                    </ion-button>
                    <h1 [style]="constants.STYLES.MARGIN_SIDES">{{ player?.score || 0 }}</h1>
                    <ion-button
                      size="small"
                      (click)="onPlayerScoreChange(2, player.userId, false)"
                    >
                      <ion-icon [name]="constants.ICONS.REMOVE"></ion-icon>
                    </ion-button>
                  </div>
                  }
                </ion-card-content>
              </ion-card>
              } } @else {
              <p>Team2 Players Count: {{ team2Players.length || 0 }}</p>
              <p>{{ constants.MESSAGES.NO_PLAYERS_FOUND }} {{ team2 }}</p>
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
  constants = APP_CONSTANTS;
  
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

  getPlayerAvatar(player: MatchPlayerWithUser): string {
    return player?.photoURL || this.constants.ASSETS.DEFAULT_AVATAR;
  }
}