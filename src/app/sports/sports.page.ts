import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonFab, IonFabButton, IonModal, IonInput, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline } from 'ionicons/icons';
import { FirestoreService } from '../services/firestore.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sports',
  templateUrl: './sports.page.html',
  styleUrls: ['./sports.page.scss'],
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonFab, IonFabButton, IonModal, IonInput, IonButtons, IonBackButton]
})
export class SportsPage {
  private firestoreService = inject(FirestoreService);
  
  sports$: Observable<any[]>;
  showSportModal = false;
  editingSport = false;
  currentSport = { id: '', name: '' };

  constructor() {
    addIcons({ addOutline, createOutline, trashOutline });
    this.sports$ = this.firestoreService.getSports();
  }

  addSport() {
    this.currentSport = { id: '', name: '' };
    this.editingSport = false;
    this.showSportModal = true;
  }

  editSport(sport: any) {
    this.currentSport = { ...sport };
    this.editingSport = true;
    this.showSportModal = true;
  }

  async saveSport() {
    if (!this.currentSport.name.trim()) return;

    try {
      if (this.editingSport) {
        await this.firestoreService.updateSport(this.currentSport.id, { name: this.currentSport.name });
      } else {
        await this.firestoreService.createSport({ name: this.currentSport.name });
      }
      this.showSportModal = false;
    } catch (error) {
      console.error('Error saving sport:', error);
    }
  }

  async deleteSport(id: string, name: string) {
    if (confirm(`Delete sport "${name}"?`)) {
      try {
        await this.firestoreService.deleteSport(id);
      } catch (error) {
        console.error('Error deleting sport:', error);
      }
    }
  }
}