import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDoc, setDoc, updateDoc, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ROLES, Role } from '../constants/roles.constants';
import { UserRole } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserRolesService {
  private firestore = inject(Firestore);

  async createUserRole(userId: string, email: string, role: Role = ROLES.VIEW): Promise<void> {
    const userRole: UserRole = {
      id: userId,
      email,
      role,
      tournamentAccess: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(doc(this.firestore, 'userRoles', userId), userRole);
  }

  async getUserRole(userId: string): Promise<UserRole | null> {
    const docSnap = await getDoc(doc(this.firestore, 'userRoles', userId));
    return docSnap.exists() ? docSnap.data() as UserRole : null;
  }

  async updateUserRole(userId: string, updates: Partial<UserRole>): Promise<void> {
    await updateDoc(doc(this.firestore, 'userRoles', userId), {
      ...updates,
      updatedAt: new Date()
    });
  }

  async grantTournamentAccess(userId: string, tournamentId: string): Promise<void> {
    const userRole = await this.getUserRole(userId);
    if (userRole) {
      const tournamentAccess = userRole.tournamentAccess || [];
      if (!tournamentAccess.includes(tournamentId)) {
        tournamentAccess.push(tournamentId);
        await this.updateUserRole(userId, { tournamentAccess });
      }
    }
  }

  async revokeTournamentAccess(userId: string, tournamentId: string): Promise<void> {
    const userRole = await this.getUserRole(userId);
    if (userRole && userRole.tournamentAccess) {
      const tournamentAccess = userRole.tournamentAccess.filter(id => id !== tournamentId);
      await this.updateUserRole(userId, { tournamentAccess });
    }
  }

  getAllUserRoles(): Observable<UserRole[]> {
    return collectionData(collection(this.firestore, 'userRoles'), { idField: 'id' }) as Observable<UserRole[]>;
  }

  async setUserRole(userId: string, role: Role): Promise<void> {
    await this.updateUserRole(userId, { role });
  }
}
