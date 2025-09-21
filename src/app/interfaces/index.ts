// Core interfaces for the tournament management system
import { Role } from '../constants/roles.constants';

export interface Tournament {
  id?: string;
  name: string;
  sport: string;
  startDate: string;
  email: string;
  editors: Editor[];
  registrationOpen?: boolean;
}

export interface TournamentWithId extends Tournament {
  id: string;
}

export interface Editor {
  approved: boolean;
  email: string;
  displayName: string;
  photoURL: string;
}

export interface Player {
  id?: string;
  name: string;
  gender: string;
  remarks: string;
  selected?: boolean;
}

export interface Team {
  id?: string;
  name: string;
}

export interface TeamPlayer {
  id?: string;
  userId: string;
  score?: number;
}

export interface TeamPlayerWithUser extends TeamPlayer {
  name: string;
  email: string;
  photoURL?: string;
}

export interface Match {
  id?: string;
  team1: string;
  team2: string;
  date?: string;
  court?: string;
  umpire?: string;
  status: string;
  score1: number;
  score2: number;
  stage: string;
  startTime: Date | null;
  endTime: Date | null;
  duration: number;
  team1Players?: TeamPlayerWithUser[];
  team2Players?: TeamPlayerWithUser[];
}

export interface Sport {
  id?: string;
  name: string;
  description?: string;
}

export interface UserRole {
  id: string;
  email: string;
  role: Role;
  tournamentAccess?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Event interfaces for component communication
export interface PlayerSaveEvent {
  player: Player;
  isEditing: boolean;
}

export interface TournamentDeleteEvent {
  id: string;
  name: string;
}

export interface EditAccessEvent {
  id: string;
  tournament: TournamentWithId;
  email: string;
  displayName: string;
  photoURL: string;
}

export interface PlayerRegistration {
  id?: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  gender: string;
  remarks?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}