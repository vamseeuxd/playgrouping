import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  user,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  updateProfile,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { TournamentWithId } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null>;
  user: User | null = null;

  constructor(private auth: Auth) {
    this.user$ = user(this.auth);
    this.user$.subscribe((user) => {
      this.user = user;
    });
  }

  hasPermission(role: 'admin' | 'editor' | 'viewer', tournament: TournamentWithId): boolean {
    if (this.user) {
      switch (role) {
        case 'admin':
          return this.user?.email === tournament.email;
        case 'editor':
          const editorEmails = tournament.editors.filter(editor => editor.approved).map(editor => editor.email);
          return this.user?.email ? editorEmails.includes(this.user.email) : false;
        case 'viewer':
          return true;
        default:
          return false;
      }
    }
    return role === 'viewer';
  }

  async login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  setViewAccess(tournamentId: string) {}

  async signup(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async logout() {
    return signOut(this.auth);
  }

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  async updateUserProfile(displayName: string, photoURL?: string) {
    if (this.user) {
      await updateProfile(this.user, { displayName, photoURL });
    }
  }
}
