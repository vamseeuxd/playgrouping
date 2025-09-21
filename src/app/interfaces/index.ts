// Core interfaces for the tournament management system
import { Role } from '../constants/roles.constants';

export interface Tournament {
  id?: string;
  name: string;
  sport: string;
  startDate: string;
  email: string;
  editors: Editor[];
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
  players: TeamPlayer[];
}

export interface TeamPlayer {
  id: string;
  name: string;
  score?: number;
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
  team1Players?: TeamPlayer[];
  team2Players?: TeamPlayer[];
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