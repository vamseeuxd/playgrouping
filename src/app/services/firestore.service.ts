import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, setDoc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Tournament, TournamentWithId, Player, Team, Match, MatchWithTeams, Sport, PlayerRegistration, UserProfile, TeamPlayer, TeamPlayerWithUser } from '../interfaces';

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
    const subcollections = ['players', 'teams', 'matches', 'registrations'];
    for (const subcollection of subcollections) {
      const snapshot = await getDocs(collection(this.firestore, `tournaments/${id}/${subcollection}`));
      for (const docSnap of snapshot.docs) {
        // For teams, also delete their players sub-collection
        if (subcollection === 'teams') {
          const playersSnapshot = await getDocs(collection(this.firestore, `tournaments/${id}/teams/${docSnap.id}/players`));
          for (const playerDoc of playersSnapshot.docs) {
            await deleteDoc(playerDoc.ref);
          }
        }
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

  async createTeam(tournamentId: string, team: Omit<Team, 'id'>, playerIds: string[] = []): Promise<void> {
    const teamRef = await addDoc(collection(this.firestore, `tournaments/${tournamentId}/teams`), team);
    
    // Add players to team's players sub-collection
    for (const userId of playerIds) {
      await addDoc(collection(this.firestore, `tournaments/${tournamentId}/teams/${teamRef.id}/players`), {
        userId
      });
    }
  }

  async updateTeam(tournamentId: string, teamId: string, team: Partial<Team>, playerIds?: string[]): Promise<void> {
    await updateDoc(doc(this.firestore, `tournaments/${tournamentId}/teams`, teamId), team);
    
    // Update players if provided
    if (playerIds !== undefined) {
      // Delete existing players
      const playersSnapshot = await getDocs(collection(this.firestore, `tournaments/${tournamentId}/teams/${teamId}/players`));
      for (const playerDoc of playersSnapshot.docs) {
        await deleteDoc(playerDoc.ref);
      }
      
      // Add new players
      for (const userId of playerIds) {
        await addDoc(collection(this.firestore, `tournaments/${tournamentId}/teams/${teamId}/players`), {
          userId
        });
      }
    }
  }

  async deleteTeam(tournamentId: string, teamId: string): Promise<void> {
    // Delete players sub-collection first
    const playersSnapshot = await getDocs(collection(this.firestore, `tournaments/${tournamentId}/teams/${teamId}/players`));
    for (const playerDoc of playersSnapshot.docs) {
      await deleteDoc(playerDoc.ref);
    }
    
    // Delete team document
    await deleteDoc(doc(this.firestore, `tournaments/${tournamentId}/teams`, teamId));
  }

  async getPlayerRegistrations(tournamentId: string): Promise<(PlayerRegistration & UserProfile)[]> {
    const snapshot = await getDocs(collection(this.firestore, `tournaments/${tournamentId}/registrations`));
    const registrations = snapshot.docs.map(doc => ({ 
      ...doc.data(), 
      registrationId: doc.id  // Store the actual registration document ID
    } as PlayerRegistration & { registrationId: string }));
    
    const registrationsWithUsers = await Promise.all(
      registrations.map(async (reg) => {
        const userProfile = await this.getUserProfile(reg.userId);
        return { 
          ...userProfile,  // User profile data first
          ...reg,          // Registration data second (preserves registrationId)
          id: reg.registrationId  // Use registration document ID as the main ID
        } as PlayerRegistration & UserProfile;
      })
    );
    
    return registrationsWithUsers;
  }

  getPlayerRegistrationsLive(tournamentId: string): Observable<(PlayerRegistration & UserProfile)[]> {
    return new Observable(observer => {
      const unsubscribe = collectionData(collection(this.firestore, `tournaments/${tournamentId}/registrations`), { idField: 'registrationId' })
        .subscribe(async (registrations: any[]) => {
          const registrationsWithUsers = await Promise.all(
            registrations.map(async (reg) => {
              const userProfile = await this.getUserProfile(reg.userId);
              return { 
                ...userProfile,
                ...reg,
                id: reg.registrationId
              } as PlayerRegistration & UserProfile;
            })
          );
          observer.next(registrationsWithUsers);
        });
      
      return () => unsubscribe.unsubscribe();
    });
  }

  // Match operations
  getMatches(tournamentId: string): Observable<Match[]> {
    return collectionData(collection(this.firestore, `tournaments/${tournamentId}/matches`), { idField: 'id' }) as Observable<Match[]>;
  }

  async getMatchesWithTeams(tournamentId: string): Promise<MatchWithTeams[]> {
    const matchesSnapshot = await getDocs(collection(this.firestore, `tournaments/${tournamentId}/matches`));
    const matches = matchesSnapshot.docs.map(doc => ({ 
      ...doc.data(), 
      id: doc.id 
    } as Match));
    
    const teamsSnapshot = await getDocs(collection(this.firestore, `tournaments/${tournamentId}/teams`));
    const teams = teamsSnapshot.docs.map(doc => ({ 
      ...doc.data(), 
      id: doc.id 
    } as Team));
    
    const teamsMap = new Map(teams.map(team => [team.id!, team.name]));
    
    return matches.map(match => ({
      ...match,
      team1Name: teamsMap.get(match.team1Id) || 'Unknown Team',
      team2Name: teamsMap.get(match.team2Id) || 'Unknown Team'
    } as MatchWithTeams));
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

  // Player Registration operations
  async createPlayerRegistration(tournamentId: string, userId: string): Promise<void> {
    // Check if user already has a registration
    const existingRegistration = await this.getUserRegistration(tournamentId, userId);
    if (existingRegistration) {
      throw new Error('User already has a registration for this tournament');
    }

    const registration: Omit<PlayerRegistration, 'id'> = {
      userId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await addDoc(collection(this.firestore, `tournaments/${tournamentId}/registrations`), registration);
  }

  async getUserRegistration(tournamentId: string, userId: string): Promise<PlayerRegistration | null> {
    const snapshot = await getDocs(collection(this.firestore, `tournaments/${tournamentId}/registrations`));
    const registration = snapshot.docs.find(doc => doc.data()['userId'] === userId);
    return registration ? { ...registration.data(), id: registration.id } as PlayerRegistration : null;
  }

  async updatePlayerRegistration(tournamentId: string, registrationId: string, updates: Partial<PlayerRegistration>): Promise<void> {
    await updateDoc(doc(this.firestore, `tournaments/${tournamentId}/registrations`, registrationId), {
      ...updates,
      updatedAt: new Date()
    });
  }

  async deletePlayerRegistration(tournamentId: string, registrationId: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `tournaments/${tournamentId}/registrations`, registrationId));
  }

  // User Profile operations
  async createUserProfile(userId: string, profile: Omit<UserProfile, 'id'>): Promise<void> {
    await setDoc(doc(this.firestore, 'users', userId), { ...profile, id: userId });
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const docSnap = await getDoc(doc(this.firestore, 'users', userId));
    return docSnap.exists() ? docSnap.data() as UserProfile : null;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    await updateDoc(doc(this.firestore, 'users', userId), {
      ...updates,
      updatedAt: new Date()
    });
  }

  async toggleTournamentRegistration(tournamentId: string): Promise<void> {
    const tournament = await this.getTournament(tournamentId);
    if (tournament) {
      await this.updateTournament(tournamentId, {
        registrationOpen: !tournament.registrationOpen
      });
    }
  }

  // Team Player operations
  async getTeamPlayers(tournamentId: string, teamId: string): Promise<TeamPlayerWithUser[]> {
    const snapshot = await getDocs(collection(this.firestore, `tournaments/${tournamentId}/teams/${teamId}/players`));
    const teamPlayers = snapshot.docs.map(doc => ({ 
      ...doc.data(), 
      id: doc.id 
    } as TeamPlayer));
    
    const playersWithUsers = await Promise.all(
      teamPlayers.map(async (player) => {
        const userProfile = await this.getUserProfile(player.userId);
        
        if (!userProfile) {
          console.error(`User profile not found for userId: ${player.userId}`);
          return { 
            ...player,
            name: 'Unknown User',
            email: '',
            photoURL: ''
          } as TeamPlayerWithUser;
        }
        
        return { 
          ...player,
          name: userProfile.name,
          email: userProfile.email,
          photoURL: userProfile.photoURL
        } as TeamPlayerWithUser;
      })
    );
    
    return playersWithUsers;
  }

  async getTeamsWithPlayers(tournamentId: string): Promise<(Team & { players: TeamPlayerWithUser[] })[]> {
    const teamsSnapshot = await getDocs(collection(this.firestore, `tournaments/${tournamentId}/teams`));
    const teams = teamsSnapshot.docs.map(doc => ({ 
      ...doc.data(), 
      id: doc.id 
    } as Team));
    
    const teamsWithPlayers = await Promise.all(
      teams.map(async (team) => {
        const players = await this.getTeamPlayers(tournamentId, team.id!);
        return { 
          ...team,
          players
        };
      })
    );
    
    return teamsWithPlayers;
  }
}
