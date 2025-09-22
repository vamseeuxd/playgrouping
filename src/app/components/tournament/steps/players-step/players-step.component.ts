import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { PlayerModalComponent } from '../../player-modal/player-modal.component';
import { APP_CONSTANTS } from '../../../../constants/app.constants';

@Component({
  selector: 'app-players-step',
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>Players</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        @for (player of players; track player.id) {
        <ion-item>
          <ion-label>
            <h3>{{ player.name }}</h3>
            <p>{{ player.gender }} - {{ player.remarks }}</p>
          </ion-label>
          <ion-button fill="clear" [color]="constants.COLORS.PRIMARY" (click)="onEditPlayer(player)">
            <ion-icon name="create-outline"></ion-icon>
          </ion-button>
          <ion-button fill="clear" [color]="constants.COLORS.DANGER" (click)="onRemovePlayer(player.id)">
            <ion-icon [name]="constants.ICONS.TRASH"></ion-icon>
          </ion-button>
        </ion-item>
        }
        <ion-button expand="block" fill="outline" (click)="onAddPlayer()">
          <ion-icon [name]="constants.ICONS.ADD" slot="start"></ion-icon>
          Add Player
        </ion-button>
      </ion-card-content>
    </ion-card>

    <app-player-modal
      [isOpen]="showPlayerModal"
      [isEditing]="editingPlayer"
      [player]="currentPlayer"
      (save)="onSavePlayer($event)"
      (close)="onCloseModal()">
    </app-player-modal>
  `,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton, IonIcon, PlayerModalComponent]
})
export class PlayersStepComponent {
  @Input() players: any[] = [];
  @Output() addPlayer = new EventEmitter<void>();
  @Output() editPlayer = new EventEmitter<any>();
  @Output() removePlayer = new EventEmitter<string>();
  @Output() savePlayer = new EventEmitter<any>();

  showPlayerModal = false;
  editingPlayer = false;
  currentPlayer = { id: '', name: '', gender: '', remarks: '' };
  constants = APP_CONSTANTS;

  onAddPlayer() {
    this.currentPlayer = { id: '', name: '', gender: '', remarks: '' };
    this.editingPlayer = false;
    this.showPlayerModal = true;
  }

  onEditPlayer(player: any) {
    this.currentPlayer = { ...player };
    this.editingPlayer = true;
    this.showPlayerModal = true;
  }

  onRemovePlayer(playerId: string) {
    this.removePlayer.emit(playerId);
  }

  onSavePlayer(player: any) {
    this.savePlayer.emit({ player, isEditing: this.editingPlayer });
    // this.showPlayerModal = false;
  }

  onCloseModal() {
    this.showPlayerModal = false;
  }
}
