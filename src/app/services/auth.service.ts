import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ROLES, PERMISSIONS, Role } from '../constants/roles.constants';

interface User {
  id: string;
  email: string;
  role: Role;
  tournamentAccess?: string; // For VIEW role - specific tournament ID
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.currentUserSubject.asObservable();

  constructor() {
    // Initialize with admin for demo
    this.setUser({
      id: '1',
      email: 'admin@tournament.com',
      role: ROLES.ADMIN
    });
  }

  setUser(user: User | null) {
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasPermission(permission: keyof typeof PERMISSIONS[Role]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    return PERMISSIONS[user.role][permission] || false;
  }

  canAccessTournament(tournamentId: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Admin and Edit can access all tournaments
    if (user.role === ROLES.ADMIN || user.role === ROLES.EDIT) {
      return true;
    }
    
    // View role can only access specific tournament
    if (user.role === ROLES.VIEW) {
      return user.tournamentAccess === tournamentId;
    }
    
    return false;
  }

  setViewAccess(tournamentId: string) {
    this.setUser({
      id: 'viewer',
      email: 'viewer@tournament.com',
      role: ROLES.VIEW,
      tournamentAccess: tournamentId
    });
  }

  setEditAccess() {
    this.setUser({
      id: 'editor',
      email: 'editor@tournament.com',
      role: ROLES.EDIT
    });
  }

  setAdminAccess() {
    this.setUser({
      id: 'admin',
      email: 'admin@tournament.com',
      role: ROLES.ADMIN
    });
  }

  async logout() {
    this.setUser(null);
  }

  async signInWithGoogle() {
    // Mock Google sign in - set admin by default
    this.setAdminAccess();
  }
}