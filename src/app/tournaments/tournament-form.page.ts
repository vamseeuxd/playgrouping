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
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonBackButton,
  IonButtons,
  IonTextarea,
  IonModal,
  IonSegment,
  IonSegmentButton,
  IonCheckbox,
} from '@ionic/angular/standalone';
import { FirestoreService } from '../services/firestore.service';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline, addOutline } from 'ionicons/icons';
import { BasicDetailsStepComponent } from '../components/tournament/steps/basic-details-step.component';
import { PlayersStepComponent } from '../components/tournament/steps/players-step.component';
import { TeamsStepComponent } from '../components/tournament/steps/teams-step.component';
import { MatchesStepComponent } from '../components/tournament/steps/matches-step.component';
import { ReviewStepComponent } from '../components/tournament/steps/review-step.component';
import { APP_CONSTANTS } from '../constants/app.constants';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-tournament-form',
  templateUrl: './tournament-form.page.html',
  styleUrls: ['./tournament-form.page.scss'],
  imports: [
    CommonModule,
    IonModal,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonBackButton,
    IonButtons,
    IonTextarea,
    IonItem,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonCheckbox,
    BasicDetailsStepComponent,
    PlayersStepComponent,
    TeamsStepComponent,
    MatchesStepComponent,
    ReviewStepComponent,
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

  tournament = {
    name: '',
    sport: '',
    startDate: '',
    email: '',
    editors: [] as {
      approved: boolean;
      email: string;
      displayName: string;
      photoURL: string;
    }[],
  };

  currentStep = '1';
  players: any[] = [];
  teams: any[] = [];
  matches: any[] = [];
  sports: any[] = [];
  showPlayerModal = false;
  showTeamModal = false;
  showMatchModal = false;
  editingPlayer = false;
  editingTeam = false;
  editingMatch = false;
  currentPlayer = { id: '', name: '', gender: '', remarks: '' };
  currentTeam: any = { id: '', name: '', players: [] };
  currentMatch: any = {
    id: '',
    team1: '',
    team2: '',
    date: '',
    court: '',
    umpire: '',
  };
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
      this.loadPlayers();
      this.loadTeams();
      this.loadMatches();
    }
    this.loadSports();
  }

  loadSports() {
    this.firestoreService.getSports().subscribe((sports) => {
      this.sports = sports;
    });
  }

  loadPlayers() {
    if (this.tournamentId) {
      this.firestoreService
        .getPlayers(this.tournamentId)
        .subscribe((players) => {
          this.players = players;
        });
    }
  }

  async onSubmit() {
    try {
      if (this.isEdit) {
        await this.firestoreService.updateTournament(
          this.tournamentId,
          this.tournament
        );
      } else {
        this.tournamentId = await this.firestoreService.createTournament(
          this.tournament
        );
        this.isEdit = true;
        return; // Stay on form to add players
      }
      this.router.navigate(['/tournaments']);
    } catch (error) {
      console.error('Error saving tournament:', error);
    }
  }

  async deleteTournament() {
    const alert = await this.alertController.create({
      header: 'Delete Tournament',
      message: 'Are you sure you want to delete this tournament?',
      buttons: [
        { text: 'No', role: 'cancel' },
        { text: 'Yes', handler: () => this.performDeleteTournament() },
      ],
    });
    await alert.present();
  }

  async performDeleteTournament() {
    try {
      await this.firestoreService.deleteTournament(this.tournamentId);
      this.router.navigate(['/tournaments']);
    } catch (error) {
      console.error('Error deleting tournament:', error);
    }
  }

  addPlayer() {
    if (!this.tournamentId) {
      alert(APP_CONSTANTS.MESSAGES.VALIDATION.SAVE_TOURNAMENT_FIRST);
      return;
    }
    this.currentPlayer = { id: '', name: '', gender: '', remarks: '' };
    this.editingPlayer = false;
    this.showPlayerModal = true;
  }

  editPlayer(player: any) {
    this.currentPlayer = { ...player };
    this.editingPlayer = true;
    this.showPlayerModal = true;
  }

  async savePlayer(event: any) {
    const { player, isEditing } = event;
    if (!player.name.trim()) return;

    const isDuplicate = this.players.some(
      (p) =>
        p.name.toLowerCase() === player.name.toLowerCase() && p.id !== player.id
    );

    if (isDuplicate) {
      alert(APP_CONSTANTS.MESSAGES.VALIDATION.DUPLICATE_PLAYER);
      return;
    }

    try {
      const playerData = {
        name: player.name,
        gender: player.gender,
        remarks: player.remarks,
      };

      if (isEditing) {
        await this.firestoreService.updatePlayer(
          this.tournamentId,
          player.id,
          playerData
        );
      } else {
        await this.firestoreService.createPlayer(this.tournamentId, playerData);
      }

      this.loadPlayers();
    } catch (error) {
      console.error('Error saving player:', error);
    }
  }

  async savePlayerFromModal() {
    if (!this.currentPlayer.name.trim()) return;

    const isDuplicate = this.players.some(
      (p) =>
        p.name.toLowerCase() === this.currentPlayer.name.toLowerCase() &&
        p.id !== this.currentPlayer.id
    );

    if (isDuplicate) {
      alert(APP_CONSTANTS.MESSAGES.VALIDATION.DUPLICATE_PLAYER);
      return;
    }

    try {
      const playerData = {
        name: this.currentPlayer.name,
        gender: this.currentPlayer.gender,
        remarks: this.currentPlayer.remarks,
      };

      if (this.editingPlayer) {
        await this.firestoreService.updatePlayer(
          this.tournamentId,
          this.currentPlayer.id,
          playerData
        );
      } else {
        await this.firestoreService.createPlayer(this.tournamentId, playerData);
      }

      // this.showPlayerModal = false;
      this.loadPlayers();
    } catch (error) {
      console.error('Error saving player:', error);
    }
  }

  async removePlayer(playerId: string) {
    const alert = await this.alertController.create({
      header: 'Remove Player',
      message: 'Remove this player?',
      buttons: [
        { text: 'No', role: 'cancel' },
        { text: 'Yes', handler: () => this.performRemovePlayer(playerId) },
      ],
    });
    await alert.present();
  }

  async performRemovePlayer(playerId: string) {
    try {
      await this.firestoreService.deletePlayer(this.tournamentId, playerId);
      this.loadPlayers();
    } catch (error) {
      console.error('Error removing player:', error);
    }
  }

  cancel() {
    this.router.navigate(['/tournaments']);
  }

  nextStep() {
    const step = parseInt(this.currentStep);
    if (step < 5) {
      this.currentStep = (step + 1).toString();
      if (step === 1 && !this.tournamentId) {
        this.saveTournament();
      }
    }
  }

  previousStep() {
    const step = parseInt(this.currentStep);
    if (step > 1) {
      this.currentStep = (step - 1).toString();
    }
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case '1':
        return !!(
          this.tournament.name &&
          this.tournament.sport &&
          this.tournament.startDate
        );
      case '2':
        return this.players.length >= 2;
      case '3':
        return this.teams.length >= 2;
      case '4':
        return this.matches.length > 0;
      default:
        return true;
    }
  }

  async saveTournament() {
    try {
      if (!this.tournamentId) {
        this.tournament.email = this.auth.currentUser?.email || '';
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

  addTeam() {
    this.currentTeam = { id: '', name: '', players: [] };
    this.editingTeam = false;
    this.showTeamModal = true;
  }

  editTeam(team: any) {
    this.currentTeam = { ...team };
    this.editingTeam = true;

    // Mark current team players as selected
    this.players.forEach((player) => {
      player.selected =
        team.players?.some((p: any) => p.id === player.id) || false;
    });

    this.showTeamModal = true;
  }

  async saveTeam() {
    const selectedPlayers = this.players
      .filter((p) => p.selected)
      .map((p) => ({ id: p.id, name: p.name }));
    
    // Auto-generate team name if empty
    if (!this.currentTeam.name.trim() && selectedPlayers.length > 0) {
      this.currentTeam.name = this.generateTeamName(selectedPlayers);
    }
    
    if (!this.currentTeam.name.trim()) return;

    const isDuplicate = this.teams.some(
      (t) =>
        t.name.toLowerCase() === this.currentTeam.name.toLowerCase() &&
        t.id !== this.currentTeam.id
    );

    if (isDuplicate) {
      alert('Team name already exists!');
      return;
    }

    this.currentTeam.players = selectedPlayers;

    try {
      if (this.editingTeam) {
        await this.firestoreService.updateTeam(
          this.tournamentId,
          this.currentTeam.id,
          this.currentTeam
        );
      } else {
        await this.firestoreService.createTeam(
          this.tournamentId,
          this.currentTeam
        );
      }

      this.showTeamModal = false;
      this.loadTeams();
      this.players.forEach((p) => (p.selected = false));
    } catch (error) {
      console.error('Error saving team:', error);
    }
  }

  async removeTeam(teamId: string) {
    const alert = await this.alertController.create({
      header: 'Remove Team',
      message: 'Remove this team?',
      buttons: [
        { text: 'No', role: 'cancel' },
        { text: 'Yes', handler: () => this.performRemoveTeam(teamId) },
      ],
    });
    await alert.present();
  }

  async performRemoveTeam(teamId: string) {
    try {
      await this.firestoreService.deleteTeam(this.tournamentId, teamId);
      this.loadTeams();
    } catch (error) {
      console.error('Error removing team:', error);
    }
  }

  loadTeams() {
    if (this.tournamentId) {
      this.firestoreService.getTeams(this.tournamentId).subscribe((teams) => {
        this.teams = teams;
      });
    }
  }

  loadMatches() {
    if (this.tournamentId) {
      this.firestoreService
        .getMatches(this.tournamentId)
        .subscribe((matches) => {
          this.matches = matches;
        });
    }
  }

  generateMatches() {
    this.matches = [];
    for (let i = 0; i < this.teams.length; i++) {
      for (let j = i + 1; j < this.teams.length; j++) {
        this.matches.push({
          id: `${i}-${j}`,
          team1: this.teams[i].name,
          team2: this.teams[j].name,
          date: new Date().toISOString().slice(0, 16),
          court: '',
          umpire: '',
          status: APP_CONSTANTS.MATCH.STATUS.PENDING,
          score1: 0,
          score2: 0,
          stage: APP_CONSTANTS.TOURNAMENT.STAGES.GROUP,
          startTime: null,
          endTime: null,
          duration: 0,
        });
      }
    }
  }

  addMatch() {
    this.currentMatch = {
      id: '',
      team1: '',
      team2: '',
      date: '',
      court: '',
      umpire: '',
    };
    this.editingMatch = false;
    this.showMatchModal = true;
  }

  editMatch(match: any) {
    this.currentMatch = { ...match };
    this.editingMatch = true;
    this.showMatchModal = true;
  }

  async saveMatch() {
    if (
      !this.currentMatch.team1 ||
      !this.currentMatch.team2 ||
      this.currentMatch.team1 === this.currentMatch.team2
    ) {
      alert(APP_CONSTANTS.MESSAGES.VALIDATION.DIFFERENT_TEAMS);
      return;
    }

    try {
      const matchData = {
        id: this.currentMatch.id || `match-${Date.now()}`,
        team1: this.currentMatch.team1,
        team2: this.currentMatch.team2,
        date: this.currentMatch.date || new Date().toISOString().slice(0, 16),
        court: this.currentMatch.court || '',
        umpire: this.currentMatch.umpire || '',
        status: APP_CONSTANTS.MATCH.STATUS.PENDING,
        score1: 0,
        score2: 0,
        stage: APP_CONSTANTS.TOURNAMENT.STAGES.GROUP,
        startTime: null,
        endTime: null,
        duration: 0,
      };

      if (this.editingMatch) {
        await this.firestoreService.updateMatch(
          this.tournamentId,
          matchData.id,
          matchData
        );
        const index = this.matches.findIndex((m) => m.id === matchData.id);
        if (index !== -1) {
          this.matches[index] = { ...matchData };
        }
      } else {
        await this.firestoreService.createMatch(this.tournamentId, matchData);
        this.matches.push({ ...matchData });
      }

      this.showMatchModal = false;
    } catch (error) {
      console.error('Error saving match:', error);
    }
  }

  removeMatch(matchId: string) {
    this.matches = this.matches.filter((m) => m.id !== matchId);
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

  getAvailablePlayers() {
    const assignedPlayerIds = new Set();

    // Get all assigned players from existing teams
    this.teams.forEach((team) => {
      if (team.players) {
        team.players.forEach((player: any) => assignedPlayerIds.add(player.id));
      }
    });

    // If editing a team, allow its current players to be available
    if (this.editingTeam && this.currentTeam.players) {
      this.currentTeam.players.forEach((player: any) =>
        assignedPlayerIds.delete(player.id)
      );
    }

    return this.players.filter((player) => !assignedPlayerIds.has(player.id));
  }

  generateTeamName(players: any[]): string {
    return players
      .map(player => player.name.split(' ')[0])
      .join(' & ');
  }

  onPlayerSelectionChange() {
    const selectedPlayers = this.players.filter(p => p.selected);
    if (selectedPlayers.length > 0) {
      this.currentTeam.name = this.generateTeamName(selectedPlayers);
    } else {
      this.currentTeam.name = '';
    }
  }
}
