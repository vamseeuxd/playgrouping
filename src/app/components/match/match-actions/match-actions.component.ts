import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  IonFab, IonFabButton, IonIcon, IonFabList } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-match-actions',
  templateUrl: './match-actions.component.html',
  styleUrls: ['./match-actions.component.scss'],
  imports: [IonFabList,
    CommonModule,
    IonFab,
    IonFabButton,
    IonFabList,
    IonIcon
  ]
})
export class MatchActionsComponent {
  @Input() status = 'pending';

  @Output() start = new EventEmitter<void>();
  @Output() pause = new EventEmitter<void>();
  @Output() stop = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();

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
