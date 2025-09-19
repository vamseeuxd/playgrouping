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
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

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

  hasPermission(role: 'admin' | 'editor' | 'viewer', tournament: any): boolean {
    const isAdmin = this.user && this.user?.email === tournament.email;
    if (this.user) {
      switch (role) {
        case 'admin':
          return this.user?.email === tournament.email;
        case 'editor':
          return tournament.editors?.includes(this.user?.email);
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
}
