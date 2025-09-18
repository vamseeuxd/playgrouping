import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
  IonDatetime,
  IonButton,
  IonBackButton,
  IonButtons,
  IonTextarea,
  IonDatetimeButton,
  IonModal,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonCheckbox,
} from '@ionic/angular/standalone';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
  collectionData,
  setDoc,
} from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline, addOutline } from 'ionicons/icons';

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
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonCheckbox
],
})
export class TournamentFormPage {
  private firestore = inject(Firestore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    addIcons({ createOutline, trashOutline, addOutline });
  }

  tournament = {
    name: '',
    sport: '',
    startDate: '',
  };

  currentStep = '1';
  players: any[] = [];
  teams: any[] = [];
  matches: any[] = [];
  showPlayerModal = false;
  showTeamModal = false;
  showMatchModal = false;
  editingPlayer = false;
  editingTeam = false;
  editingMatch = false;
  currentPlayer = { id: '', name: '', gender: '', remarks: '' };
  currentTeam: any = { id: '', name: '', players: [] };
  currentMatch: any = { id: '', team1: '', team2: '', date: '', court: '', umpire: '' };
  isEdit = false;
  tournamentId = '';

  async ngOnInit() {
    this.tournamentId = this.route.snapshot.params['id'];
    this.isEdit = !!this.tournamentId;

    if (this.isEdit) {
      const docRef = doc(this.firestore, 'tournaments', this.tournamentId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.tournament = docSnap.data() as any;
      }
      this.loadPlayers();
      this.loadTeams();
      this.loadMatches();
    }
  }

  loadPlayers() {
    if (this.tournamentId) {
      const playersCollection = collection(this.firestore, `tournaments/${this.tournamentId}/players`);
      collectionData(playersCollection, { idField: 'id' }).subscribe(players => {
        this.players = players;
      });
    }
  }

  async onSubmit() {
    try {
      if (this.isEdit) {
        const docRef = doc(this.firestore, 'tournaments', this.tournamentId);
        await updateDoc(docRef, this.tournament);
      } else {
        const docRef = await addDoc(
          collection(this.firestore, 'tournaments'),
          this.tournament
        );
        this.tournamentId = docRef.id;
        this.isEdit = true;
        return; // Stay on form to add players
      }
      this.router.navigate(['/tournaments']);
    } catch (error) {
      console.error('Error saving tournament:', error);
    }
  }

  async deleteTournament() {
    if (confirm('Are you sure you want to delete this tournament?')) {
      try {
        const docRef = doc(this.firestore, 'tournaments', this.tournamentId);
        await deleteDoc(docRef);
        this.router.navigate(['/tournaments']);
      } catch (error) {
        console.error('Error deleting tournament:', error);
      }
    }
  }

  addPlayer() {
    if (!this.tournamentId) {
      alert('Please save the tournament first');
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

  async savePlayer() {
    if (!this.currentPlayer.name.trim()) return;

    const isDuplicate = this.players.some(p =>
      p.name.toLowerCase() === this.currentPlayer.name.toLowerCase() && p.id !== this.currentPlayer.id
    );

    if (isDuplicate) {
      alert('Player name already exists!');
      return;
    }

    try {
      const playersCollection = collection(this.firestore, `tournaments/${this.tournamentId}/players`);

      if (this.editingPlayer) {
        const playerDoc = doc(this.firestore, `tournaments/${this.tournamentId}/players`, this.currentPlayer.id);
        await updateDoc(playerDoc, {
          name: this.currentPlayer.name,
          gender: this.currentPlayer.gender,
          remarks: this.currentPlayer.remarks
        });
      } else {
        await addDoc(playersCollection, {
          name: this.currentPlayer.name,
          gender: this.currentPlayer.gender,
          remarks: this.currentPlayer.remarks
        });
      }

      this.showPlayerModal = false;
      this.loadPlayers();
    } catch (error) {
      console.error('Error saving player:', error);
    }
  }

  async removePlayer(playerId: string) {
    if (confirm('Remove this player?')) {
      try {
        const playerDoc = doc(this.firestore, `tournaments/${this.tournamentId}/players`, playerId);
        await deleteDoc(playerDoc);
        this.loadPlayers();
      } catch (error) {
        console.error('Error removing player:', error);
      }
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
        return !!(this.tournament.name && this.tournament.sport && this.tournament.startDate);
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
        const docRef = await addDoc(collection(this.firestore, 'tournaments'), this.tournament);
        this.tournamentId = docRef.id;
        this.isEdit = true;
      } else {
        const docRef = doc(this.firestore, 'tournaments', this.tournamentId);
        await updateDoc(docRef, this.tournament);
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
    this.players.forEach(player => {
      player.selected = team.players?.some((p: any) => p.id === player.id) || false;
    });
    
    this.showTeamModal = true;
  }

  async saveTeam() {
    if (!this.currentTeam.name.trim()) return;

    const selectedPlayers = this.players.filter(p => p.selected).map(p => ({ id: p.id, name: p.name }));
    this.currentTeam.players = selectedPlayers;

    try {
      const teamsCollection = collection(this.firestore, `tournaments/${this.tournamentId}/teams`);

      if (this.editingTeam) {
        const teamDoc = doc(this.firestore, `tournaments/${this.tournamentId}/teams`, this.currentTeam.id);
        await updateDoc(teamDoc, this.currentTeam);
      } else {
        await addDoc(teamsCollection, this.currentTeam);
      }

      this.showTeamModal = false;
      this.loadTeams();
      this.players.forEach(p => p.selected = false);
    } catch (error) {
      console.error('Error saving team:', error);
    }
  }

  async removeTeam(teamId: string) {
    if (confirm('Remove this team?')) {
      try {
        const teamDoc = doc(this.firestore, `tournaments/${this.tournamentId}/teams`, teamId);
        await deleteDoc(teamDoc);
        this.loadTeams();
      } catch (error) {
        console.error('Error removing team:', error);
      }
    }
  }

  loadTeams() {
    if (this.tournamentId) {
      const teamsCollection = collection(this.firestore, `tournaments/${this.tournamentId}/teams`);
      collectionData(teamsCollection, { idField: 'id' }).subscribe(teams => {
        this.teams = teams;
      });
    }
  }

  loadMatches() {
    if (this.tournamentId) {
      const matchesCollection = collection(this.firestore, `tournaments/${this.tournamentId}/matches`);
      collectionData(matchesCollection, { idField: 'id' }).subscribe(matches => {
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
          date: new Date().toISOString().slice(0, 16)
        });
      }
    }
  }

  addMatch() {
    this.currentMatch = { id: '', team1: '', team2: '', date: '', court: '', umpire: '' };
    this.editingMatch = false;
    this.showMatchModal = true;
  }

  editMatch(match: any) {
    this.currentMatch = { ...match };
    this.editingMatch = true;
    this.showMatchModal = true;
  }

  async saveMatch() {
    if (!this.currentMatch.team1 || !this.currentMatch.team2 || this.currentMatch.team1 === this.currentMatch.team2) {
      alert('Please select different teams');
      return;
    }

    try {
      const matchesCollection = collection(this.firestore, `tournaments/${this.tournamentId}/matches`);
      
      if (this.editingMatch) {
        const matchDoc = doc(this.firestore, `tournaments/${this.tournamentId}/matches`, this.currentMatch.id);
        await setDoc(matchDoc, this.currentMatch, { merge: true });
        const index = this.matches.findIndex(m => m.id === this.currentMatch.id);
        if (index !== -1) {
          this.matches[index] = { ...this.currentMatch };
        }
      } else {
        this.currentMatch.id = Date.now().toString();
        await addDoc(matchesCollection, this.currentMatch);
        this.matches.push({ ...this.currentMatch });
      }
      
      this.showMatchModal = false;
    } catch (error) {
      console.error('Error saving match:', error);
    }
  }

  removeMatch(matchId: string) {
    this.matches = this.matches.filter(m => m.id !== matchId);
  }

  async submitTournament() {
    await this.saveTournament();
    this.router.navigate(['/tournaments']);
  }

  getAvailablePlayers() {
    const assignedPlayerIds = new Set();
    
    // Get all assigned players from existing teams
    this.teams.forEach(team => {
      if (team.players) {
        team.players.forEach((player: any) => assignedPlayerIds.add(player.id));
      }
    });
    
    // If editing a team, allow its current players to be available
    if (this.editingTeam && this.currentTeam.players) {
      this.currentTeam.players.forEach((player: any) => assignedPlayerIds.delete(player.id));
    }
    
    return this.players.filter(player => !assignedPlayerIds.has(player.id));
  }
}
