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
    IonDatetimeButton,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonDatetime,
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

  players: any[] = [];
  showPlayerModal = false;
  editingPlayer = false;
  currentPlayer = { id: '', name: '', gender: '', remarks: '' };
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
}
