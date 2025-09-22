import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonButton, IonButtons } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { APP_CONSTANTS } from '../../constants/app.constants';

@Component({
  selector: 'app-match-controls',
  template: `
  <ion-buttons class="ion-justify-content-between">
    @if (status === statusTypes.PENDING) {

    <ion-button color="success" (click)="onStart()">
      Start
    </ion-button>

    } @if (status === statusTypes.STARTED) {

    <ion-button color="medium" (click)="onPause()">
      Pause
    </ion-button>

    <ion-button fill="clear" color="danger" (click)="onStop()">
      End
    </ion-button>

    } @if (status === statusTypes.PAUSED) {

    <ion-button fill="clear" color="success" (click)="onStart()">
      Resume
    </ion-button>

    <ion-button fill="clear" color="danger" (click)="onStop()">
      End
    </ion-button>

    } @if (status !== statusTypes.PENDING) {

    <ion-button
      fill="clear"
      color="secondary"
      (click)="onReset()"
    >
      Reset
    </ion-button>

    }
</ion-buttons>
  `,
  imports: [CommonModule, IonButton, IonButtons],
})
export class MatchControlsComponent {
  @Input() status: string = APP_CONSTANTS.MATCH.STATUS.PENDING;
  @Output() start = new EventEmitter<void>();
  @Output() pause = new EventEmitter<void>();
  @Output() stop = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();

  statusTypes = APP_CONSTANTS.MATCH.STATUS;

  onStart() {
    this.start.emit();
  }

  onPause() {
    this.pause.emit();
  }

  onStop() {
    this.stop.emit();
  }

  onReset() {
    this.reset.emit();
  }
}
