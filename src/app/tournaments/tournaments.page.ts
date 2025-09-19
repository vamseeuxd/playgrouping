import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonFab, IonFabButton, LoadingController, AlertController, ToastController } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { trophyOutline, addOutline, settingsOutline, flaskOutline, trashOutline, statsChartOutline } from 'ionicons/icons';
import { FirestoreService } from '../services/firestore.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TournamentCardComponent } from '../components/tournament/tournament-card.component';
import { APP_CONSTANTS } from '../constants/app.constants';

@Component({
  selector: 'app-tournaments',
  templateUrl: './tournaments.page.html',
  styleUrls: ['./tournaments.page.scss'],
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonFab, IonFabButton, IonIcon, TournamentCardComponent]
})
export class TournamentsPage {
  private firestoreService = inject(FirestoreService);
  private loadingController = inject(LoadingController);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private router = inject(Router);
  
  tournaments$: Observable<any[]>;

  constructor() {
    addIcons({ trophyOutline, addOutline, settingsOutline, flaskOutline, trashOutline, statsChartOutline });
    this.tournaments$ = this.firestoreService.getTournaments();
  }

  async createMockData() {
    const alert = await this.alertController.create({
      header: 'Create Mock Data',
      message: APP_CONSTANTS.MESSAGES.CONFIRM.CREATE_MOCK_DATA,
      buttons: [
        { text: 'No', role: 'cancel' },
        { text: 'Yes', handler: () => this.performCreateMockData() }
      ]
    });
    await alert.present();
  }

  async performCreateMockData() {
    
    const loading = await this.loadingController.create({ message: APP_CONSTANTS.MESSAGES.LOADING.CREATING_MOCK_DATA });
    await loading.present();
    
    try {
      // Create tournament
      const tournamentId = await this.firestoreService.createTournament({
        name: APP_CONSTANTS.MOCK_DATA.TOURNAMENT_NAME,
        sport: APP_CONSTANTS.MOCK_DATA.SPORT,
        startDate: new Date().toISOString()
      });
      
      // Create players
      const players = APP_CONSTANTS.MOCK_DATA.PLAYERS;
      
      for (const player of players) {
        await this.firestoreService.createPlayer(tournamentId, player);
      }
      
      // Create teams
      const teams = APP_CONSTANTS.MOCK_DATA.TEAMS;
      
      for (const team of teams) {
        await this.firestoreService.createTeam(tournamentId, team);
      }
      
      // Create matches
      const matches = APP_CONSTANTS.MOCK_DATA.MATCHES;
      
      for (const match of matches) {
        await this.firestoreService.createMatch(tournamentId, {
          ...match,
          startTime: match.status !== APP_CONSTANTS.MATCH.STATUS.PENDING ? new Date() : null,
          endTime: match.status === APP_CONSTANTS.MATCH.STATUS.FINISHED ? new Date() : null,
          duration: match.status === APP_CONSTANTS.MATCH.STATUS.FINISHED ? APP_CONSTANTS.MATCH.DEFAULT_DURATION : 0
        });
      }
      
      const toast = await this.toastController.create({
        message: APP_CONSTANTS.MESSAGES.SUCCESS.MOCK_DATA_CREATED,
        duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
        color: APP_CONSTANTS.UI.COLORS.SUCCESS
      });
      await toast.present();
    } catch (error) {
      console.error('Error creating mock data:', error);
      const toast = await this.toastController.create({
        message: APP_CONSTANTS.MESSAGES.ERROR.MOCK_DATA_CREATE,
        duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
        color: APP_CONSTANTS.UI.COLORS.DANGER
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }

  addTournament() {
    this.router.navigate(['/tournaments/add']);
  }

  editTournament(id: string) {
    this.router.navigate(['/tournaments/edit', id]);
  }

  async deleteTournament(id: string, name: string) {
    const alert = await this.alertController.create({
      header: 'Delete Tournament',
      message: APP_CONSTANTS.MESSAGES.CONFIRM.DELETE_TOURNAMENT.replace('{name}', name),
      buttons: [
        { text: 'No', role: 'cancel' },
        { text: 'Yes', handler: () => this.performDeleteTournament(id, name) }
      ]
    });
    await alert.present();
  }

  async performDeleteTournament(id: string, name: string) {
    
    const loading = await this.loadingController.create({ message: APP_CONSTANTS.MESSAGES.LOADING.DELETING_TOURNAMENT });
    await loading.present();
    
    try {
      await this.firestoreService.deleteTournament(id);
      const toast = await this.toastController.create({
        message: APP_CONSTANTS.MESSAGES.SUCCESS.TOURNAMENT_DELETED,
        duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
        color: APP_CONSTANTS.UI.COLORS.SUCCESS
      });
      await toast.present();
    } catch (error) {
      console.error('Error deleting tournament:', error);
      const toast = await this.toastController.create({
        message: APP_CONSTANTS.MESSAGES.ERROR.TOURNAMENT_DELETE,
        duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
        color: APP_CONSTANTS.UI.COLORS.DANGER
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }
}