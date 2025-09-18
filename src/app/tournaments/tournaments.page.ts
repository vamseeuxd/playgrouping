import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { trophyOutline, addOutline, settingsOutline, flaskOutline, trashOutline } from 'ionicons/icons';
import { Firestore, collection, collectionData, addDoc, doc, setDoc, deleteDoc, getDocs } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tournaments',
  templateUrl: './tournaments.page.html',
  styleUrls: ['./tournaments.page.scss'],
  imports: [CommonModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonFab, IonFabButton]
})
export class TournamentsPage {
  private firestore = inject(Firestore);
  private router = inject(Router);
  
  tournaments$: Observable<any[]>;

  constructor() {
    addIcons({ trophyOutline, addOutline, settingsOutline, flaskOutline, trashOutline });
    const tournamentsCollection = collection(this.firestore, 'tournaments');
    this.tournaments$ = collectionData(tournamentsCollection, { idField: 'id' });
  }

  async createMockData() {
    if (!confirm('Create mock tournament with players, teams, and matches?')) return;
    
    try {
      // Create tournament
      const tournamentRef = await addDoc(collection(this.firestore, 'tournaments'), {
        name: 'Mock Championship 2024',
        sport: 'football',
        startDate: new Date().toISOString()
      });
      
      const tournamentId = tournamentRef.id;
      
      // Create players
      const players = [
        { name: 'John Doe', gender: 'Male', remarks: 'Captain' },
        { name: 'Jane Smith', gender: 'Female', remarks: 'Striker' },
        { name: 'Mike Johnson', gender: 'Male', remarks: 'Defender' },
        { name: 'Sarah Wilson', gender: 'Female', remarks: 'Midfielder' },
        { name: 'Tom Brown', gender: 'Male', remarks: 'Goalkeeper' },
        { name: 'Lisa Davis', gender: 'Female', remarks: 'Winger' },
        { name: 'Chris Lee', gender: 'Male', remarks: 'Forward' },
        { name: 'Amy Taylor', gender: 'Female', remarks: 'Defender' }
      ];
      
      for (const player of players) {
        await addDoc(collection(this.firestore, `tournaments/${tournamentId}/players`), player);
      }
      
      // Create teams
      const teams = [
        { name: 'Team Alpha', players: [{ name: 'John Doe' }, { name: 'Jane Smith' }] },
        { name: 'Team Beta', players: [{ name: 'Mike Johnson' }, { name: 'Sarah Wilson' }] },
        { name: 'Team Gamma', players: [{ name: 'Tom Brown' }, { name: 'Lisa Davis' }] },
        { name: 'Team Delta', players: [{ name: 'Chris Lee' }, { name: 'Amy Taylor' }] }
      ];
      
      for (const team of teams) {
        await addDoc(collection(this.firestore, `tournaments/${tournamentId}/teams`), team);
      }
      
      // Create matches
      const matches = [
        { team1: 'Team Alpha', team2: 'Team Beta', status: 'finished', score1: 3, score2: 1, stage: 'group' },
        { team1: 'Team Gamma', team2: 'Team Delta', status: 'finished', score1: 2, score2: 2, stage: 'group' },
        { team1: 'Team Alpha', team2: 'Team Gamma', status: 'started', score1: 1, score2: 0, stage: 'group' },
        { team1: 'Team Beta', team2: 'Team Delta', status: 'pending', score1: 0, score2: 0, stage: 'group' }
      ];
      
      for (const match of matches) {
        await addDoc(collection(this.firestore, `tournaments/${tournamentId}/matches`), {
          ...match,
          startTime: match.status !== 'pending' ? new Date() : null,
          endTime: match.status === 'finished' ? new Date() : null,
          duration: match.status === 'finished' ? 90 : 0
        });
      }
      
      alert('Mock tournament created successfully!');
    } catch (error) {
      console.error('Error creating mock data:', error);
      alert('Error creating mock data');
    }
  }

  addTournament() {
    this.router.navigate(['/tournaments/add']);
  }

  editTournament(id: string) {
    this.router.navigate(['/tournaments/edit', id]);
  }

  async deleteTournament(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This will delete all players, teams, and matches.`)) return;
    
    try {
      // Delete subcollections
      const subcollections = ['players', 'teams', 'matches'];
      
      for (const subcollection of subcollections) {
        const subCollection = collection(this.firestore, `tournaments/${id}/${subcollection}`);
        const snapshot = await getDocs(subCollection);
        
        for (const docSnap of snapshot.docs) {
          await deleteDoc(docSnap.ref);
        }
      }
      
      // Delete tournament
      await deleteDoc(doc(this.firestore, 'tournaments', id));
      
      alert('Tournament deleted successfully!');
    } catch (error) {
      console.error('Error deleting tournament:', error);
      alert('Error deleting tournament');
    }
  }
}