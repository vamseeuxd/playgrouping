import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  // Tournament operations
  getTournaments(): Observable<any[]> {
    return collectionData(collection(this.firestore, 'tournaments'), { idField: 'id' });
  }

  async getTournament(id: string): Promise<any> {
    const docSnap = await getDoc(doc(this.firestore, 'tournaments', id));
    return docSnap.exists() ? { ...docSnap.data(), id } : null;
  }

  async createTournament(tournament: any): Promise<string> {
    const docRef = await addDoc(collection(this.firestore, 'tournaments'), tournament);
    return docRef.id;
  }

  async updateTournament(id: string, tournament: any): Promise<void> {
    await updateDoc(doc(this.firestore, 'tournaments', id), tournament);
  }

  async deleteTournament(id: string): Promise<void> {
    // Delete subcollections first
    const subcollections = ['players', 'teams', 'matches'];
    for (const subcollection of subcollections) {
      const snapshot = await getDocs(collection(this.firestore, `tournaments/${id}/${subcollection}`));
      for (const docSnap of snapshot.docs) {
        await deleteDoc(docSnap.ref);
      }
    }
    await deleteDoc(doc(this.firestore, 'tournaments', id));
  }

  // Player operations
  getPlayers(tournamentId: string): Observable<any[]> {
    return collectionData(collection(this.firestore, `tournaments/${tournamentId}/players`), { idField: 'id' });
  }

  async createPlayer(tournamentId: string, player: any): Promise<void> {
    await addDoc(collection(this.firestore, `tournaments/${tournamentId}/players`), player);
  }

  async updatePlayer(tournamentId: string, playerId: string, player: any): Promise<void> {
    await updateDoc(doc(this.firestore, `tournaments/${tournamentId}/players`, playerId), player);
  }

  async deletePlayer(tournamentId: string, playerId: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `tournaments/${tournamentId}/players`, playerId));
  }

  // Team operations
  getTeams(tournamentId: string): Observable<any[]> {
    return collectionData(collection(this.firestore, `tournaments/${tournamentId}/teams`), { idField: 'id' });
  }

  async createTeam(tournamentId: string, team: any): Promise<void> {
    await addDoc(collection(this.firestore, `tournaments/${tournamentId}/teams`), team);
  }

  async updateTeam(tournamentId: string, teamId: string, team: any): Promise<void> {
    await updateDoc(doc(this.firestore, `tournaments/${tournamentId}/teams`, teamId), team);
  }

  async deleteTeam(tournamentId: string, teamId: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `tournaments/${tournamentId}/teams`, teamId));
  }

  // Match operations
  getMatches(tournamentId: string): Observable<any[]> {
    return collectionData(collection(this.firestore, `tournaments/${tournamentId}/matches`), { idField: 'id' });
  }

  async getMatch(tournamentId: string, matchId: string): Promise<any> {
    const docSnap = await getDoc(doc(this.firestore, `tournaments/${tournamentId}/matches`, matchId));
    return docSnap.exists() ? { ...docSnap.data(), id: matchId } : null;
  }

  async createMatch(tournamentId: string, match: any): Promise<void> {
    await addDoc(collection(this.firestore, `tournaments/${tournamentId}/matches`), match);
  }

  async updateMatch(tournamentId: string, matchId: string, match: any): Promise<void> {
    await setDoc(doc(this.firestore, `tournaments/${tournamentId}/matches`, matchId), match, { merge: true });
  }

  async deleteMatch(tournamentId: string, matchId: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `tournaments/${tournamentId}/matches`, matchId));
  }

  // Sports operations
  getSports(): Observable<any[]> {
    return collectionData(collection(this.firestore, 'sports'), { idField: 'id' });
  }

  async createSport(sport: any): Promise<void> {
    await addDoc(collection(this.firestore, 'sports'), sport);
  }

  async updateSport(sportId: string, sport: any): Promise<void> {
    await updateDoc(doc(this.firestore, 'sports', sportId), sport);
  }

  async deleteSport(sportId: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'sports', sportId));
  }
}