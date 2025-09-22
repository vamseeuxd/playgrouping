import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonFab, IonFabButton, IonModal, IonInput, IonButtons, IonBackButton, LoadingController, AlertController, ToastController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline } from 'ionicons/icons';
import { FirestoreService } from '../services/firestore.service';
import { APP_CONSTANTS } from '../constants/app.constants';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sports',
  templateUrl: './sports.page.html',

  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonFab, IonFabButton, IonModal, IonInput, IonButtons, IonBackButton]
})
export class SportsPage {
  private firestoreService = inject(FirestoreService);
  private loadingController = inject(LoadingController);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  
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

    const loading = await this.loadingController.create({ message: APP_CONSTANTS.MESSAGES.LOADING.SAVING_SPORT });
    await loading.present();

    try {
      if (this.editingSport) {
        await this.firestoreService.updateSport(this.currentSport.id, { name: this.currentSport.name });
      } else {
        await this.firestoreService.createSport({ name: this.currentSport.name });
      }
      this.showSportModal = false;
      const toast = await this.toastController.create({
        message: APP_CONSTANTS.MESSAGES.SUCCESS.SPORT_SAVED,
        duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
        color: APP_CONSTANTS.UI.COLORS.SUCCESS
      });
      await toast.present();
    } catch (error) {
      console.error('Error saving sport:', error);
      const toast = await this.toastController.create({
        message: APP_CONSTANTS.MESSAGES.ERROR.SPORT_SAVE,
        duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
        color: APP_CONSTANTS.UI.COLORS.DANGER
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }

  async deleteSport(id: string, name: string) {
    const alert = await this.alertController.create({
      header: 'Delete Sport',
      message: APP_CONSTANTS.MESSAGES.CONFIRM.DELETE_SPORT.replace('{name}', name),
      buttons: [
        { text: 'No', role: 'cancel' },
        { text: 'Yes', handler: () => this.performDeleteSport(id) }
      ]
    });
    await alert.present();
  }

  async performDeleteSport(id: string) {
      const loading = await this.loadingController.create({ message: APP_CONSTANTS.MESSAGES.LOADING.DELETING_SPORT });
      await loading.present();
      
      try {
        await this.firestoreService.deleteSport(id);
        const toast = await this.toastController.create({
          message: APP_CONSTANTS.MESSAGES.SUCCESS.SPORT_DELETED,
          duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
          color: APP_CONSTANTS.UI.COLORS.SUCCESS
        });
        await toast.present();
      } catch (error) {
        console.error('Error deleting sport:', error);
        const toast = await this.toastController.create({
          message: APP_CONSTANTS.MESSAGES.ERROR.SPORT_DELETE,
          duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
          color: APP_CONSTANTS.UI.COLORS.DANGER
        });
        await toast.present();
      } finally {
        await loading.dismiss();
      }
  }
}
