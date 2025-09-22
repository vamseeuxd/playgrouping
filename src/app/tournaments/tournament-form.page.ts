import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  LoadingController,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonBackButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { FirestoreService } from '../services/firestore.service';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline, addOutline } from 'ionicons/icons';
import { BasicDetailsStepComponent } from '../components/tournament/steps/basic-details-step/basic-details-step.component';
import { APP_CONSTANTS } from '../constants/app.constants';
import { Auth } from '@angular/fire/auth';
import {
  Tournament,
  Player,
  Team,
  Match,
  Sport,
  TeamPlayer,
} from '../interfaces';

@Component({
  selector: 'app-tournament-form',
  templateUrl: './tournament-form.page.html',
  styleUrls: ['./tournament-form.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonBackButton,
    IonButtons,

    BasicDetailsStepComponent,
  ],
})
export class TournamentFormPage {
  private firestoreService = inject(FirestoreService);
  private loadingController = inject(LoadingController);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private auth = inject(Auth);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    addIcons({ createOutline, trashOutline, addOutline });
  }

  tournament: Tournament = {
    name: '',
    sport: '',
    startDate: '',
    email: '',
    editors: [],
  };

  sports: Sport[] = [];
  isEdit = false;
  tournamentId = '';

  async ngOnInit() {
    this.tournamentId = this.route.snapshot.params['id'];
    this.isEdit = !!this.tournamentId;

    if (this.isEdit) {
      const tournament = await this.firestoreService.getTournament(
        this.tournamentId
      );
      if (tournament) {
        this.tournament = tournament;
      }
    }
    this.loadSports();
  }

  loadSports() {
    this.firestoreService.getSports().subscribe((sports) => {
      this.sports = sports;
    });
  }

  cancel() {
    this.router.navigate(['/tournaments']);
  }

  canProceed(): boolean {
    return !!(
      this.tournament.name &&
      this.tournament.sport &&
      this.tournament.startDate
    );
  }

  async saveTournament() {
    try {
      if (!this.tournamentId) {
        this.tournament.email = this.auth.currentUser?.email || '';
        this.tournament.registrationOpen = true;
        if (this.tournament.email) {
          this.tournament.editors = [
            {
              approved: true,
              email: this.tournament.email,
              displayName: this.auth.currentUser?.displayName || '',
              photoURL: this.auth.currentUser?.photoURL || '',
            },
          ];
        }
        this.tournamentId = await this.firestoreService.createTournament(
          this.tournament
        );
        this.isEdit = true;
      } else {
        await this.firestoreService.updateTournament(
          this.tournamentId,
          this.tournament
        );
      }
    } catch (error) {
      console.error('Error saving tournament:', error);
    }
  }

  async submitTournament() {
    const loading = await this.loadingController.create({
      message: APP_CONSTANTS.MESSAGES.LOADING.UPDATING_TOURNAMENT,
    });
    await loading.present();

    try {
      if (this.isEdit) {
        await this.firestoreService.updateTournament(
          this.tournamentId,
          this.tournament
        );
      } else {
        this.tournament.email = this.auth.currentUser?.email || '';
        this.tournament.editors = [
          {
            approved: true,
            email: this.auth.currentUser?.email || '',
            displayName: this.auth.currentUser?.displayName || '',
            photoURL: this.auth.currentUser?.photoURL || '',
          },
        ];
        this.tournament.registrationOpen = true;
        await this.firestoreService.createTournament(this.tournament);
      }
      const toast = await this.toastController.create({
        message: APP_CONSTANTS.MESSAGES.SUCCESS.TOURNAMENT_UPDATED,
        duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
        color: APP_CONSTANTS.UI.COLORS.SUCCESS,
      });
      await toast.present();
      this.router.navigate(['/tournaments']);
    } catch (error) {
      console.error('Error saving tournament:', error);
      const toast = await this.toastController.create({
        message: APP_CONSTANTS.MESSAGES.ERROR.TOURNAMENT_UPDATE,
        duration: APP_CONSTANTS.UI.TOAST_DURATION.MEDIUM,
        color: APP_CONSTANTS.UI.COLORS.DANGER,
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }
}
