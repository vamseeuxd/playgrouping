export const APP_CONSTANTS = {
  // Routes
  ROUTES: {
    LOGIN: '/login',
    TOURNAMENTS: '/tournaments',
    SCOREBOARD: '/scoreboard',
    KNOCKOUT: '/knockout',
    MATCH_CONTROL: '/match-control',
    TEAM_MANAGEMENT: '/team-management',
    PLAYER_REGISTRATION: '/player-registration'
  },

  // Icons
  ICONS: {
    // Navigation & UI
    GRID: 'grid-outline',
    MENU: 'ellipsis-vertical-outline',
    ADD: 'add-outline',
    REMOVE: 'remove-outline',
    CLOSE: 'close-outline',
    
    // Actions
    STATS: 'stats-chart-outline',
    TROPHY: 'trophy-outline',
    SETTINGS: 'settings-outline',
    QR_CODE: 'qr-code-outline',
    TRASH: 'trash-outline',
    LIST: 'list-outline',
    ALBUMS: 'albums-outline',
    PERSON_ADD: 'person-add-outline',
    PEOPLE: 'people-outline',
    LOCK_CLOSED: 'lock-closed-outline',
    LOCK_OPEN: 'lock-open-outline'
  },

  // Colors
  COLORS: {
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    TERTIARY: 'tertiary',
    SUCCESS: 'success',
    WARNING: 'warning',
    DANGER: 'danger',
    MEDIUM: 'medium',
    DARK: 'dark',
    LIGHT: 'light'
  },

  // Chip Colors Array
  CHIP_COLORS: ['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'medium', 'dark'],

  // Match Status
  MATCH: {
    STATUS: {
      PENDING: 'pending',
      STARTED: 'started',
      PAUSED: 'paused',
      COMPLETED: 'completed',
      FINISHED: 'finished'
    }
  },

  // Tournament
  TOURNAMENT: {
    MIN_TEAMS: 2,
    STAGES: {
      GROUP: 'group',
      ROUND_16: 'round_16',
      QUARTER: 'quarter',
      SEMI: 'semi',
      FINAL: 'final'
    },
    STAGE_NAMES: ['Group', 'Round of 16', 'Quarter Final', 'Semi Final', 'Final'],
    STAGE_KEYS: ['group', 'round_16', 'quarter', 'semi', 'final'],
    STAGE_CAPACITY: {
      group: 32,
      round_16: 16,
      quarter: 8,
      semi: 4,
      final: 2
    },
    POINTS: {
      WIN: 3,
      DRAW: 1
    }
  },

  // Common Styles
  STYLES: {
    FLEX_ROW_BETWEEN: 'display: flex; flex-direction: row; align-content: center; align-items: center; justify-content: space-between;',
    FLEX_ROW_CENTER: 'display: flex; flex-direction: row; align-content: center; align-items: center; justify-content: center;',
    FLEX_CENTER: 'display: flex; align-items: center; justify-content: center;',
    BORDER: 'border: 1px solid #ccc;',
    CHIPS_CONTAINER: 'display: flex; overflow-x: auto; gap: 4px; white-space: nowrap;',
    CHIP: 'flex-shrink: 0;',
    ITEM: 'position: relative;',
    BUTTON: 'position: absolute; top: 8px; right: 8px; z-index: 10;',
    POSITION_RELATIVE: 'position: relative;',
    ABSOLUTE_TOP_RIGHT: 'position: absolute; top: 8px; right: 8px; z-index: 10;',
    MARGIN_SIDES: 'margin: 0 20px;',
    MAX_WIDTH_50: 'max-width: 50px; margin-top: 10px;'
  },

  // Assets
  ASSETS: {
    DEFAULT_AVATAR: '../../../assets/default-avatar.png',
    VS_IMAGE: '../../../assets/vs.png',
    PRAVATAR_BASE: 'https://i.pravatar.cc/300?u='
  },

  // Messages
  MESSAGES: {
    NO_PLAYERS_FOUND: 'No players found for',
    NO_EDITORS_ASSIGNED: 'No editors assigned.',
    UNKNOWN: 'Unknown',
    LOADING: {
      DEFAULT: 'Loading...',
      SAVING_SPORT: 'Saving sport...',
      DELETING_SPORT: 'Deleting sport...',
      GENERATING_MATCHES: 'Generating matches...',
      ADVANCING_ROUND: 'Advancing to next round...',
      REMOVING_EDITOR: 'Removing editor...',
      APPROVING_EDIT_ACCESS: 'Approving edit access...',
      ASK_EDIT_TOURNAMENT: 'Requesting edit access...',
      DELETING_TOURNAMENT: 'Deleting tournament...',
      UPDATING_TOURNAMENT: 'Updating tournament...'
    },
    SUCCESS: {
      SPORT_SAVED: 'Sport saved successfully',
      SPORT_DELETED: 'Sport deleted successfully',
      MATCHES_GENERATED: 'Matches generated successfully',
      EDITOR_REMOVED: 'Editor removed successfully',
      EDIT_ACCESS_APPROVED: 'Edit access approved',
      ASK_EDIT_TOURNAMENT: 'Edit access requested',
      TOURNAMENT_DELETED: 'Tournament deleted successfully',
      TOURNAMENT_UPDATED: 'Tournament updated successfully'
    },
    ERROR: {
      SPORT_SAVE: 'Failed to save sport',
      SPORT_DELETE: 'Failed to delete sport',
      MATCHES_GENERATE: 'Failed to generate matches',
      REMOVE_EDITOR: 'Failed to remove editor',
      EDIT_ACCESS_APPROVE: 'Failed to approve edit access',
      ASK_EDIT_TOURNAMENT_EXISTS: 'Edit access already requested',
      ASK_EDIT_TOURNAMENT: 'Failed to request edit access',
      TOURNAMENT_DELETE: 'Failed to delete tournament',
      TOURNAMENT_UPDATE: 'Failed to update tournament'
    },
    CONFIRM: {
      DELETE_SPORT: 'Are you sure you want to delete {name}?',
      DELETE_TOURNAMENT: 'Are you sure you want to delete {name}?',
      REMOVE_EDITOR: 'Remove {name} as editor?',
      ASK_EDIT_TOURNAMENT: 'Request edit access for {name}?'
    },
    VALIDATION: {
      MIN_TEAMS: 'At least 2 teams are required',
      TOURNAMENT_COMPLETE: 'Tournament is already complete',
      MIN_TEAMS_ADVANCE: 'Need at least {count} teams to advance'
    }
  },

  // Button Labels
  BUTTONS: {
    START: 'Start',
    PAUSE: 'Pause',
    RESUME: 'Resume',
    END: 'End',
    RESET: 'Reset',
    LOGOUT: 'Logout',
    SIGN_IN_GOOGLE: 'Sign in with Google',
    SIGN_IN_ANONYMOUS: 'Continue as Guest'
  },

  // Permissions
  PERMISSIONS: {
    ADMIN: 'admin',
    EDITOR: 'editor',
    VIEWER: 'viewer',
    GUEST: 'guest'
  },

  // UI Constants
  UI: {
    TOAST_DURATION: {
      SHORT: 2000,
      MEDIUM: 3000,
      LONG: 5000
    },
    COLORS: {
      SUCCESS: 'success',
      DANGER: 'danger',
      WARNING: 'warning'
    }
  }
} as const;