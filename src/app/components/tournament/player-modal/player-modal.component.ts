import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonInput, IonSelect, IonSelectOption, IonTextarea } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { GENDER_OPTIONS } from '../../constants/app.constants';

@Component({
  selector: 'app-player-modal',
  template: `
    <ion-modal [isOpen]="isOpen" (didDismiss)="onDismiss()">
      <ng-template>
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>{{ isEditing ? 'Edit' : 'Add' }} Player</ion-title>
            <ion-buttons slot="end">
              <ion-button (click)="onClose()">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <form #playerForm="ngForm" (ngSubmit)="onSave()">
            <ion-input
              label="Player Name"
              class="ion-margin-bottom"
              label-placement="floating"
              fill="outline"
              [(ngModel)]="player.name"
              name="playerName"
              required
            ></ion-input>

            <ion-select
              label="Gender"
              class="ion-margin-bottom"
              label-placement="floating"
              fill="outline"
              [(ngModel)]="player.gender"
              name="playerGender"
              required
            >
              <ion-select-option value="Male">Male</ion-select-option>
              <ion-select-option value="Female">Female</ion-select-option>
            </ion-select>

            <ion-textarea
              label="Remarks"
              class="ion-margin-bottom"
              label-placement="floating"
              fill="outline"
              [(ngModel)]="player.remarks"
              name="playerRemarks"
              rows="3"
            ></ion-textarea>

            <ion-button expand="block" type="submit" [disabled]="!playerForm.valid">
              {{ isEditing ? 'Update' : 'Add' }} Player
            </ion-button>
          </form>
        </ion-content>
      </ng-template>
    </ion-modal>
  `,
  imports: [CommonModule, FormsModule, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonInput, IonSelect, IonSelectOption, IonTextarea]
})
export class PlayerModalComponent {
  @Input() isOpen = false;
  @Input() isEditing = false;
  @Input() player = { id: '', name: '', gender: '', remarks: '' };
  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();
  
  genderOptions = GENDER_OPTIONS;

  onSave() {
    this.save.emit(this.player);
  }

  onClose() {
    this.close.emit();
  }

  onDismiss() {
    this.close.emit();
  }
}