import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonIcon,
  IonFab,
  IonFabButton,
  LoadingController,
  IonMenuButton,
  AlertController,
  ToastController, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  trophyOutline,
  addOutline,
  settingsOutline,
  flaskOutline,
  trashOutline,
  statsChartOutline,
  qrCodeOutline,
} from 'ionicons/icons';
import { FirestoreService } from '../services/firestore.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TournamentCardComponent } from '../components/tournament/tournament-card.component';
import { APP_CONSTANTS } from '../constants/app.constants';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tournaments',
  templateUrl: './tournaments.page.html',
  styleUrls: ['./tournaments.page.scss'],
  imports: [IonButtons, 
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonFab,
    IonFabButton,
    IonIcon,
    IonMenuButton,
    TournamentCardComponent,
  ],
})
export class TournamentsPage {
  firestoreService = inject(FirestoreService);
  loadingController = inject(LoadingController);
  alertController = inject(AlertController);
  toastController = inject(ToastController);
  router = inject(Router);
  authService = inject(AuthService);

  tournaments$: Observable<any[]>;

  get canCreateTournament() {
    return !!this.authService.user?.email;
  }

  constructor() {
    addIcons({
      trophyOutline,
      addOutline,
      settingsOutline,
      flaskOutline,
      trashOutline,
      statsChartOutline,
      qrCodeOutline,
    });
    this.tournaments$ = this.firestoreService.getTournaments();
  }

  async createMockData() {
    const alert = await this.alertController.create({
      header: 'Create Mock Data',
      message: APP_CONSTANTS.MESSAGES.CONFIRM.CREATE_MOCK_DATA,
      buttons: [
        { text: 'No', role: 'cancel' },
        { text: 'Yes', handler: () => this.performCreateMockData() },
      ],
    });
    await alert.present();
  }

  async performCreateMockData() {
    const loading = await this.loadingController.create({
      message: APP_CONSTANTS.MESSAGES.LOADING.CREATING_MOCK_DATA,
    });
    await loading.present();

    try {
      // Create tournament
      const tournamentId = await this.firestoreService.createTournament({
        name: APP_CONSTANTS.MOCK_DATA.TOURNAMENT_NAME,
        sport: APP_CONSTANTS.MOCK_DATA.SPORT,
        startDate: new Date().toISOString(),
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

      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        await this.firestoreService.createMatch(tournamentId, {
          id: `match-${i}`,
          team1: match.team1,
          team2: match.team2,
          status: match.status || APP_CONSTANTS.MATCH.STATUS.PENDING,
          score1: match.score1 || 0,
          score2: match.score2 || 0,
          stage: match.stage || APP_CONSTANTS.TOURNAMENT.STAGES.GROUP,
          startTime:
            match.status === APP_CONSTANTS.MATCH.STATUS.FINISHED
              ? new Date()
              : null,
          endTime:
            match.status === APP_CONSTANTS.MATCH.STATUS.FINISHED
              ? new Date()
              : null,
          duration:
            match.status === APP_CONSTANTS.MATCH.STATUS.FINISHED
              ? APP_CONSTANTS.MATCH.DEFAULT_DURATION
              : 0,
        });
      }

      const toast = await this.toastController.create({
        message: APP_CONSTANTS.MESSAGES.SUCCESS.MOCK_DATA_CREATED,
        duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
        color: APP_CONSTANTS.UI.COLORS.SUCCESS,
      });
      await toast.present();
    } catch (error) {
      console.error('Error creating mock data:', error);
      const toast = await this.toastController.create({
        message: APP_CONSTANTS.MESSAGES.ERROR.MOCK_DATA_CREATE,
        duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
        color: APP_CONSTANTS.UI.COLORS.DANGER,
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
      message: APP_CONSTANTS.MESSAGES.CONFIRM.DELETE_TOURNAMENT.replace(
        '{name}',
        name
      ),
      buttons: [
        { text: 'No', role: 'cancel' },
        { text: 'Yes', handler: () => this.performDeleteTournament(id, name) },
      ],
    });
    await alert.present();
  }

  async removeEditAccess(id: string, tournament: any, email: string) {
    const alert = await this.alertController.create({
      header: 'Remove Editor',
      message: APP_CONSTANTS.MESSAGES.CONFIRM.REMOVE_EDITOR.replace(
        '{email}',
        email
      ),
      buttons: [
        { text: 'No', role: 'cancel' },
        { text: 'Yes', handler: () => this.performRemoveEditAccess(id, tournament, email) },
      ],
    });
    await alert.present();
  }

  async performRemoveEditAccess(id: string, tournament: any, email: string) {
    const loading = await this.loadingController.create({
      message: APP_CONSTANTS.MESSAGES.LOADING.REMOVING_EDITOR,
    });
    await loading.present();
    
    try {
      tournament.editors = tournament.editors.filter((editor: any) => editor.email !== email);
      await this.firestoreService.updateTournament(id, tournament);
      const toast = await this.toastController.create({
        message: APP_CONSTANTS.MESSAGES.SUCCESS.EDITOR_REMOVED,
        duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
        color: APP_CONSTANTS.UI.COLORS.SUCCESS,
      });
      await toast.present();
    } catch (error) {
      console.error('Error removing editor:', error);
      const toast = await this.toastController.create({
        message: APP_CONSTANTS.MESSAGES.ERROR.REMOVE_EDITOR,
        duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
        color: APP_CONSTANTS.UI.COLORS.DANGER,
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    } 
  } 

  async approveEditAccess(id: string, tournament: any, email: string) {
    debugger;
    const loading = await this.loadingController.create({
      message: APP_CONSTANTS.MESSAGES.LOADING.APPROVING_EDIT_ACCESS,
    });
    await loading.present();
    
    try {
      await this.firestoreService.approveEditAccess(id, tournament, email);
      const toast = await this.toastController.create({
        message: APP_CONSTANTS.MESSAGES.SUCCESS.EDIT_ACCESS_APPROVED,
        duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
        color: APP_CONSTANTS.UI.COLORS.SUCCESS,
      });
      await toast.present();
    } catch (error) {
      console.error('Error approving edit access:', error);
      const toast = await this.toastController.create({
        message: APP_CONSTANTS.MESSAGES.ERROR.EDIT_ACCESS_APPROVE,
        duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
        color: APP_CONSTANTS.UI.COLORS.DANGER,
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    } 
  }

  async askEditTournament(id: string, tournament: any, email: string, displayName: string, photoURL: string) {
    if(tournament.editors.some((obj: any) => obj.email === email)) {
      const toast = await this.toastController.create({
        message: APP_CONSTANTS.MESSAGES.ERROR.ASK_EDIT_TOURNAMENT_EXISTS,
        duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
        color: APP_CONSTANTS.UI.COLORS.WARNING,
      });
      await toast.present();
      return;
    }
    const alert = await this.alertController.create({
      header: 'Edit Tournament Request',
      message: APP_CONSTANTS.MESSAGES.CONFIRM.ASK_EDIT_TOURNAMENT.replace(
        '{name}',
        tournament.name
      ),
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Yes',
          handler: () => this.performAskEditTournament(id, tournament, email, displayName, photoURL),
        },
      ],
    });
    await alert.present();
  }

  async performAskEditTournament(id: string, tournament: any, email: string, displayName: string, photoURL: string) {

    const loading = await this.loadingController.create({
      message: APP_CONSTANTS.MESSAGES.LOADING.ASK_EDIT_TOURNAMENT,
    });
    await loading.present();
    
    try {
      await this.firestoreService.requestEditAccess(id, tournament, email, displayName, photoURL);
      const toast = await this.toastController.create({
        message: APP_CONSTANTS.MESSAGES.SUCCESS.ASK_EDIT_TOURNAMENT,
        duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
        color: APP_CONSTANTS.UI.COLORS.SUCCESS,
      });
      await toast.present();
    } catch (error) {
      console.error('Error sending edit request:', error);
      const toast = await this.toastController.create({
        message: APP_CONSTANTS.MESSAGES.ERROR.ASK_EDIT_TOURNAMENT,
        duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
        color: APP_CONSTANTS.UI.COLORS.DANGER,
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }

  async performDeleteTournament(id: string, name: string) {
    const loading = await this.loadingController.create({
      message: APP_CONSTANTS.MESSAGES.LOADING.DELETING_TOURNAMENT,
    });
    await loading.present();

    try {
      await this.firestoreService.deleteTournament(id);
      const toast = await this.toastController.create({
        message: APP_CONSTANTS.MESSAGES.SUCCESS.TOURNAMENT_DELETED,
        duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
        color: APP_CONSTANTS.UI.COLORS.SUCCESS,
      });
      await toast.present();
    } catch (error) {
      console.error('Error deleting tournament:', error);
      const toast = await this.toastController.create({
        message: APP_CONSTANTS.MESSAGES.ERROR.TOURNAMENT_DELETE,
        duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
        color: APP_CONSTANTS.UI.COLORS.DANGER,
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }
}
