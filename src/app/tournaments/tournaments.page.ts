import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
  ToastController, 
  IonButtons,
  IonButton,
  IonSearchbar,
  IonChip,
  IonLabel,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  trophyOutline,
  addOutline,
  settingsOutline,
  flaskOutline,
  trashOutline,
  statsChartOutline,
  qrCodeOutline,
  searchOutline,
  playCircleOutline,
  peopleOutline,
  calendarOutline
} from 'ionicons/icons';
import { FirestoreService } from '../services/firestore.service';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { TournamentCardComponent } from '../components/tournament/tournament-card/tournament-card.component';
import { APP_CONSTANTS } from '../constants/app.constants';
import { AuthService } from '../services/auth.service';
import { TournamentWithId } from '../interfaces';

@Component({
  selector: 'app-tournaments',
  templateUrl: './tournaments.page.html',
  styleUrls: ['./tournaments.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,

    IonFab,
    IonFabButton,
    IonIcon,
    IonMenuButton,
    IonButtons,
    IonButton,
    IonSearchbar,
    IonChip,
    IonLabel,
    IonSpinner,
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
  filteredTournaments$!: Observable<TournamentWithId[]>;
  
  // Search and Filter State
  showSearch = false;
  searchTerm = '';
  selectedSport = 'all';
  availableSports: string[] = [];
  isLoading = true;
  
  // Stats
  totalTournaments = 0;
  activeTournaments = 0;
  openRegistrations = 0;
  
  // Subjects for reactive filtering
  private searchSubject = new BehaviorSubject<string>('');
  private sportFilterSubject = new BehaviorSubject<string>('all');

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
      searchOutline,
      playCircleOutline,
      peopleOutline,
      calendarOutline
    });
    
    this.tournaments$ = this.firestoreService.getTournaments();
    this.initializeFiltering();
    this.loadTournamentStats();
  }
  
  private initializeFiltering() {
    // Setup search with debounce
    const search$ = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    );
    
    // Combine tournaments with search and filter criteria
    this.filteredTournaments$ = combineLatest([
      this.tournaments$,
      search$,
      this.sportFilterSubject
    ]).pipe(
      map(([tournaments, searchTerm, sportFilter]) => {
        let filtered = tournaments;
        
        // Apply search filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter(tournament => 
            tournament.name.toLowerCase().includes(term) ||
            tournament.sport.toLowerCase().includes(term)
          );
        }
        
        // Apply sport filter
        if (sportFilter !== 'all') {
          filtered = filtered.filter(tournament => 
            tournament.sport.toLowerCase() === sportFilter.toLowerCase()
          );
        }
        
        return filtered;
      })
    );
    
    // Extract available sports for filter chips
    this.tournaments$.subscribe(tournaments => {
      this.availableSports = [...new Set(tournaments.map(t => t.sport))].sort();
      this.isLoading = false;
    });
  }
  
  private async loadTournamentStats() {
    this.tournaments$.subscribe(tournaments => {
      this.totalTournaments = tournaments.length;
      this.activeTournaments = tournaments.filter(t => 
        new Date(t.startDate) <= new Date() && 
        new Date(t.startDate) >= new Date()
      ).length;
      this.openRegistrations = tournaments.filter(t => t.registrationOpen).length;
    });
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
  
  // Modern UI Methods
  toggleSearchMode() {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.searchTerm = '';
      this.selectedSport = 'all';
      this.searchSubject.next('');
      this.sportFilterSubject.next('all');
    }
  }
  
  onSearchChange(event: any) {
    const value = event.target.value || '';
    this.searchTerm = value;
    this.searchSubject.next(value);
  }
  
  filterBySport(sport: string) {
    this.selectedSport = sport;
    this.sportFilterSubject.next(sport);
  }
}
