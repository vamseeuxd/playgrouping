import { Component, Input, Output, EventEmitter } from '@angular/core';
import { 
  IonAvatar, IonButton, IonIcon 
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-team-score',
  templateUrl: './team-score.component.html',
  styleUrls: ['./team-score.component.scss'],
  imports: [
    CommonModule,
    IonAvatar,
    IonButton,
    IonIcon
  ]
})
export class TeamScoreComponent {
  @Input() teamName = '';
  @Input() teamScore = 0;
  @Input() players: any[] = [];
  @Input() canEdit = false;
  @Input() teamNumber = 1;

  @Output() playerScoreChange = new EventEmitter<{
    team: number;
    playerId: string;
    increment: boolean;
  }>();

  getPlayerInitial(name: string): string {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  }

  onScoreChange(playerId: string, increment: boolean) {
    this.playerScoreChange.emit({
      team: this.teamNumber,
      playerId,
      increment
    });
  }
}