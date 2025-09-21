import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, setDoc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Tournament, TournamentWithId, Player, Team, Match, Sport } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  // Tournament operations
  getTournaments(): Observable<TournamentWithId[]> {
    return collectionData(collection(this.firestore, 'tournaments'), { idField: 'id' }) as Observable<TournamentWithId[]>;
  }

  async getTournament(id: string): Promise<TournamentWithId | null> {
    const docSnap = await getDoc(doc(this.firestore, 'tournaments', id));
    return docSnap.exists() ? { ...docSnap.data(), id } as TournamentWithId : null;
  }

  async createTournament(tournament: Omit<Tournament, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(this.firestore, 'tournaments'), tournament);
    return docRef.id;
  }

  async updateTournament(id: string, tournament: Partial<Tournament>): Promise<void> {
    await updateDoc(doc(this.firestore, 'tournaments', id), tournament as any);
  }

  async removeEditAccess(id: string, tournament: TournamentWithId, email: string): Promise<void> {
    tournament.editors = tournament.editors.filter(editor => editor.email !== email);
    await updateDoc(doc(this.firestore, 'tournaments', id), tournament as any);
  }

  async requestEditAccess(id: string, tournament: TournamentWithId, email: string, displayName: string, photoURL: string): Promise<void> {
    tournament.editors = [...tournament.editors, { approved: false, email, displayName, photoURL }];
    await updateDoc(doc(this.firestore, 'tournaments', id), tournament as any);
  }
  
  
  async approveEditAccess(id: string, tournament: TournamentWithId, email: string): Promise<void> {
    tournament.editors = tournament.editors.map(editor => {
      if (editor.email === email) {
        return { ...editor, approved: true };
      }
      return editor;
    });
    await updateDoc(doc(this.firestore, 'tournaments', id), tournament as any);
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
  getPlayers(tournamentId: string): Observable<Player[]> {
    return collectionData(collection(this.firestore, `tournaments/${tournamentId}/players`), { idField: 'id' }) as Observable<Player[]>;
  }

  async createPlayer(tournamentId: string, player: Omit<Player, 'id'>): Promise<void> {
    await addDoc(collection(this.firestore, `tournaments/${tournamentId}/players`), player);
  }

  async updatePlayer(tournamentId: string, playerId: string, player: Partial<Player>): Promise<void> {
    await updateDoc(doc(this.firestore, `tournaments/${tournamentId}/players`, playerId), player);
  }

  async deletePlayer(tournamentId: string, playerId: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `tournaments/${tournamentId}/players`, playerId));
  }

  // Team operations
  getTeams(tournamentId: string): Observable<Team[]> {
    return collectionData(collection(this.firestore, `tournaments/${tournamentId}/teams`), { idField: 'id' }) as Observable<Team[]>;
  }

  async createTeam(tournamentId: string, team: Omit<Team, 'id'>): Promise<void> {
    await addDoc(collection(this.firestore, `tournaments/${tournamentId}/teams`), team);
  }

  async updateTeam(tournamentId: string, teamId: string, team: Partial<Team>): Promise<void> {
    await updateDoc(doc(this.firestore, `tournaments/${tournamentId}/teams`, teamId), team);
  }

  async deleteTeam(tournamentId: string, teamId: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `tournaments/${tournamentId}/teams`, teamId));
  }

  // Match operations
  getMatches(tournamentId: string): Observable<Match[]> {
    return collectionData(collection(this.firestore, `tournaments/${tournamentId}/matches`), { idField: 'id' }) as Observable<Match[]>;
  }

  getLiveMatchData(tournamentId: string, matchId: string): Observable<Match> {
    return docData(doc(this.firestore, `tournaments/${tournamentId}/matches`, matchId), { idField: 'id' }) as Observable<Match>;
  }

  async getMatch(tournamentId: string, matchId: string): Promise<Match | null> {
    const docSnap = await getDoc(doc(this.firestore, `tournaments/${tournamentId}/matches`, matchId));
    return docSnap.exists() ? { ...docSnap.data(), id: matchId } as Match : null;
  }

  async createMatch(tournamentId: string, match: Omit<Match, 'id'>): Promise<void> {
    await addDoc(collection(this.firestore, `tournaments/${tournamentId}/matches`), match);
  }

  async updateMatch(tournamentId: string, matchId: string, match: Partial<Match>): Promise<void> {
    await setDoc(doc(this.firestore, `tournaments/${tournamentId}/matches`, matchId), match, { merge: true });
  }

  async deleteMatch(tournamentId: string, matchId: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `tournaments/${tournamentId}/matches`, matchId));
  }

  // Sports operations
  getSports(): Observable<Sport[]> {
    return collectionData(collection(this.firestore, 'sports'), { idField: 'id' }) as Observable<Sport[]>;
  }

  async createSport(sport: Omit<Sport, 'id'>): Promise<void> {
    await addDoc(collection(this.firestore, 'sports'), sport);
  }

  async updateSport(sportId: string, sport: Partial<Sport>): Promise<void> {
    await updateDoc(doc(this.firestore, 'sports', sportId), sport);
  }

  async deleteSport(sportId: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'sports', sportId));
  }
}