import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonButton, IonButtons } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { APP_CONSTANTS } from '../../../constants/app.constants';

@Component({
  selector: 'app-match-controls',
  templateUrl: './match-controls.component.html',
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
