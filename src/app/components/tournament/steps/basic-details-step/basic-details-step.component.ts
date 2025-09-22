import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonInput, IonSelect, IonSelectOption, IonChip } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-basic-details-step',
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>Basic Details</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <form #basicForm="ngForm">
          <ion-input
            label="Tournament Name"
            class="ion-margin-bottom"
            label-placement="floating"
            fill="outline"
            [(ngModel)]="tournament.name"
            name="name"
            required
          ></ion-input>

          <ion-select
            label="Sport"
            label-placement="floating"
            fill="outline"
            [(ngModel)]="tournament.sport"
            name="sport"
            required
          >
            @for (sport of sports; track sport.id) {
            <ion-select-option [value]="sport.name">{{ sport.name }}</ion-select-option>
            }
          </ion-select>

          <div class="ion-margin-bottom" style="display: flex; flex-direction: row; justify-content: flex-end; ">
            <ion-chip color="primary" routerLink="/sports">Manage Sports</ion-chip>
          </div>

          <ion-input
            label="Start Date"
            class="ion-margin-bottom"
            label-placement="floating"
            fill="outline"
            type="datetime-local"
            [(ngModel)]="tournament.startDate"
            name="startDate"
          ></ion-input>
        </form>
        <ng-content></ng-content>        
      </ion-card-content>
    </ion-card>
  `,
  imports: [CommonModule, FormsModule, RouterLink, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonInput, IonSelect, IonSelectOption, IonChip]
})
export class BasicDetailsStepComponent {
  @Input() tournament: any = {};
  @Input() sports: any[] = [];
  @Output() tournamentChange = new EventEmitter<any>();

  ngOnInit() {
    this.tournamentChange.emit(this.tournament);
  }
}
