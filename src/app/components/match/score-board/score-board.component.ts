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
import { MatchPlayerWithUser } from '../../../interfaces';
import { APP_CONSTANTS } from '../../../constants/app.constants';

@Component({
  selector: 'app-score-board',
  templateUrl: './score-board.component.html',

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
