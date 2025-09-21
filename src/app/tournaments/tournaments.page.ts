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
import { TournamentWithId } from '../interfaces';

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

  tournaments$: Observable<TournamentWithId[]>;

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

  async removeEditAccess(id: string, tournament: TournamentWithId, email: string) {
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

  async performRemoveEditAccess(id: string, tournament: TournamentWithId, email: string) {
    const loading = await this.loadingController.create({
      message: APP_CONSTANTS.MESSAGES.LOADING.REMOVING_EDITOR,
    });
    await loading.present();
    
    try {
      tournament.editors = tournament.editors.filter(editor => editor.email !== email);
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

  async approveEditAccess(id: string, tournament: TournamentWithId, email: string) {
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

  async askEditTournament(id: string, tournament: TournamentWithId, email: string, displayName: string, photoURL: string) {
    if(tournament.editors.some(editor => editor.email === email)) {
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

  async performAskEditTournament(id: string, tournament: TournamentWithId, email: string, displayName: string, photoURL: string) {

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

  async registerAsPlayer(tournamentId: string, tournamentName: string) {
    if (!this.authService.user?.uid) return;

    // Check if user already has a registration
    const existingRegistration = await this.firestoreService.getUserRegistration(tournamentId, this.authService.user.uid);
    
    if (existingRegistration) {
      const alert = await this.alertController.create({
        header: 'Already Registered',
        message: 'You have already sent a registration request for this tournament.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    this.router.navigate(['/player-registration', tournamentId], {
      queryParams: { tournamentName }
    });
  }

  async toggleRegistration(tournamentId: string) {
    const loading = await this.loadingController.create({
      message: 'Updating registration status...'
    });
    await loading.present();

    try {
      await this.firestoreService.toggleTournamentRegistration(tournamentId);
      const toast = await this.toastController.create({
        message: 'Registration status updated successfully!',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error toggling registration:', error);
      const toast = await this.toastController.create({
        message: 'Error updating registration status',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }

  manageTeams(tournamentId: string) {
    this.router.navigate(['/team-management', tournamentId]);
  }
}
