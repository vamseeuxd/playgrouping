import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonButton, IonIcon, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { APP_CONSTANTS } from '../../constants/app.constants';

@Component({
  selector: 'app-match-controls',
  template: `
    <ion-grid>
      <ion-row>
        @if (status === statusTypes.PENDING) {
        <ion-col>
          <ion-button expand="block" color="success" (click)="onStart()">
            <ion-icon name="play-outline" slot="start"></ion-icon>
            Start Match
          </ion-button>
        </ion-col>
        }
        
        @if (status === statusTypes.STARTED) {
        <ion-col>
          <ion-button expand="block" color="warning" (click)="onPause()">
            <ion-icon name="pause-outline" slot="start"></ion-icon>
            Pause Match
          </ion-button>
        </ion-col>
        <ion-col>
          <ion-button expand="block" color="danger" (click)="onStop()">
            <ion-icon name="stop-outline" slot="start"></ion-icon>
            End Match
          </ion-button>
        </ion-col>
        }
        
        @if (status === statusTypes.PAUSED) {
        <ion-col>
          <ion-button expand="block" color="success" (click)="onStart()">
            <ion-icon name="play-outline" slot="start"></ion-icon>
            Resume Match
          </ion-button>
        </ion-col>
        <ion-col>
          <ion-button expand="block" color="danger" (click)="onStop()">
            <ion-icon name="stop-outline" slot="start"></ion-icon>
            End Match
          </ion-button>
        </ion-col>
        }
      </ion-row>
      
      @if (status !== statusTypes.PENDING && status !== statusTypes.FINISHED) {
      <ion-row>
        <ion-col>
          <ion-button expand="block" color="warning" fill="outline" (click)="onReset()">
            Reset Match
          </ion-button>
        </ion-col>
      </ion-row>
      }
    </ion-grid>
  `,
  imports: [CommonModule, IonButton, IonIcon, IonGrid, IonRow, IonCol]
})
export class MatchControlsComponent {
  @Input() status = APP_CONSTANTS.MATCH.STATUS.PENDING;
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