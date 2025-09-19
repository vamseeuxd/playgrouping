export const ROLES = {
  ADMIN: 'admin',
  EDIT: 'edit', 
  VIEW: 'view'
} as const;

export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    canViewScoreboard: true,
    canCreateTournament: true,
    canEditTournament: true,
    canDeleteTournament: true,
    canManagePlayers: true,
    canManageTeams: true,
    canManageMatches: true,
    canControlMatch: true,
    canManageSports: true
  },
  [ROLES.EDIT]: {
    canViewScoreboard: true,
    canCreateTournament: true,
    canEditTournament: true,
    canDeleteTournament: false,
    canManagePlayers: true,
    canManageTeams: true,
    canManageMatches: true,
    canControlMatch: true,
    canManageSports: true
  },
  [ROLES.VIEW]: {
    canViewScoreboard: true,
    canCreateTournament: false,
    canEditTournament: false,
    canDeleteTournament: false,
    canManagePlayers: false,
    canManageTeams: false,
    canManageMatches: false,
    canControlMatch: false,
    canManageSports: false
  }
};

export type Role = typeof ROLES[keyof typeof ROLES];