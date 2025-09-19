import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonFab, IonFabButton, IonModal, IonInput, IonButtons, IonBackButton, LoadingController, AlertController } from '@ionic/angular/standalone';
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
  private loadingController = inject(LoadingController);
  private alertController = inject(AlertController);
  
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

    const loading = await this.loadingController.create({ message: 'Saving sport...' });
    await loading.present();

    try {
      if (this.editingSport) {
        await this.firestoreService.updateSport(this.currentSport.id, { name: this.currentSport.name });
      } else {
        await this.firestoreService.createSport({ name: this.currentSport.name });
      }
      this.showSportModal = false;
    } catch (error) {
      console.error('Error saving sport:', error);
    } finally {
      await loading.dismiss();
    }
  }

  async deleteSport(id: string, name: string) {
    const alert = await this.alertController.create({
      header: 'Delete Sport',
      message: `Delete sport "${name}"?`,
      buttons: [
        { text: 'No', role: 'cancel' },
        { text: 'Yes', handler: () => this.performDeleteSport(id) }
      ]
    });
    await alert.present();
  }

  async performDeleteSport(id: string) {
      const loading = await this.loadingController.create({ message: 'Deleting sport...' });
      await loading.present();
      
      try {
        await this.firestoreService.deleteSport(id);
      } catch (error) {
        console.error('Error deleting sport:', error);
      } finally {
        await loading.dismiss();
      }
  }
}