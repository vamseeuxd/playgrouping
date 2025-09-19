export const APP_CONSTANTS = {
  // Tournament constants
  TOURNAMENT: {
    MIN_TEAMS: 2,
    MIN_PLAYERS: 2,
    POINTS: {
      WIN: 3,
      DRAW: 1,
      LOSS: 0
    },
    STAGES: {
      GROUP: 'group',
      ROUND_16: 'round16',
      QUARTER: 'quarter',
      SEMI: 'semi',
      FINAL: 'final'
    },
    STAGE_NAMES: [
      'Group Stage',
      'Round of 16', 
      'Quarter Finals',
      'Semi Finals',
      'Finals'
    ],
    STAGE_KEYS: ['group', 'round16', 'quarter', 'semi', 'final'],
    STAGE_CAPACITY: {
      1: 16, // Round of 16
      2: 8,  // Quarter Finals
      3: 4,  // Semi Finals
      4: 2   // Finals
    }
  },

  // Match constants
  MATCH: {
    STATUS: {
      PENDING: 'pending',
      STARTED: 'started',
      PAUSED: 'paused',
      FINISHED: 'finished'
    },
    DEFAULT_DURATION: 90 // minutes
  },

  // UI constants
  UI: {
    TOAST_DURATION: {
      SHORT: 2000,
      MEDIUM: 3000,
      LONG: 5000
    },
    COLORS: {
      SUCCESS: 'success',
      WARNING: 'warning',
      DANGER: 'danger',
      PRIMARY: 'primary',
      MEDIUM: 'medium'
    }
  },

  // Mock data
  MOCK_DATA: {
    TOURNAMENT_NAME: 'Mock Championship 2024',
    SPORT: 'football',
    PLAYERS: [
      { name: 'John Doe', gender: 'Male', remarks: 'Captain' },
      { name: 'Jane Smith', gender: 'Female', remarks: 'Striker' },
      { name: 'Mike Johnson', gender: 'Male', remarks: 'Defender' },
      { name: 'Sarah Wilson', gender: 'Female', remarks: 'Midfielder' },
      { name: 'Tom Brown', gender: 'Male', remarks: 'Goalkeeper' },
      { name: 'Lisa Davis', gender: 'Female', remarks: 'Winger' },
      { name: 'Chris Lee', gender: 'Male', remarks: 'Forward' },
      { name: 'Amy Taylor', gender: 'Female', remarks: 'Defender' }
    ],
    TEAMS: [
      { name: 'Team Alpha', players: [{ name: 'John Doe' }, { name: 'Jane Smith' }] },
      { name: 'Team Beta', players: [{ name: 'Mike Johnson' }, { name: 'Sarah Wilson' }] },
      { name: 'Team Gamma', players: [{ name: 'Tom Brown' }, { name: 'Lisa Davis' }] },
      { name: 'Team Delta', players: [{ name: 'Chris Lee' }, { name: 'Amy Taylor' }] }
    ],
    MATCHES: [
      { team1: 'Team Alpha', team2: 'Team Beta', status: 'finished', score1: 3, score2: 1, stage: 'group' },
      { team1: 'Team Gamma', team2: 'Team Delta', status: 'finished', score1: 2, score2: 2, stage: 'group' },
      { team1: 'Team Alpha', team2: 'Team Gamma', status: 'started', score1: 1, score2: 0, stage: 'group' },
      { team1: 'Team Beta', team2: 'Team Delta', status: 'pending', score1: 0, score2: 0, stage: 'group' }
    ]
  },

  // Messages
  MESSAGES: {
    SUCCESS: {
      TOURNAMENT_CREATED: 'Tournament created successfully!',
      TOURNAMENT_UPDATED: 'Tournament updated successfully!',
      TOURNAMENT_DELETED: 'Tournament deleted successfully!',
      SPORT_SAVED: 'Sport saved successfully!',
      SPORT_DELETED: 'Sport deleted successfully!',
      MATCH_STARTED: 'Match started successfully!',
      MATCH_PAUSED: 'Match paused successfully!',
      MATCH_ENDED: 'Match ended successfully!',
      MATCH_RESET: 'Match reset successfully!',
      MATCHES_GENERATED: 'Matches generated successfully!',
      MOCK_DATA_CREATED: 'Mock tournament created successfully!'
    },
    ERROR: {
      TOURNAMENT_CREATE: 'Error creating tournament',
      TOURNAMENT_UPDATE: 'Error updating tournament',
      TOURNAMENT_DELETE: 'Error deleting tournament',
      SPORT_SAVE: 'Error saving sport',
      SPORT_DELETE: 'Error deleting sport',
      MATCH_START: 'Error starting match',
      MATCH_PAUSE: 'Error pausing match',
      MATCH_END: 'Error ending match',
      MATCH_RESET: 'Error resetting match',
      MATCH_LOAD: 'Error loading match',
      MATCH_UPDATE: 'Error updating score',
      MATCHES_GENERATE: 'Error generating matches',
      ADVANCE_ROUND: 'Error advancing to next round',
      MOCK_DATA_CREATE: 'Error creating mock data'
    },
    LOADING: {
      CREATING_TOURNAMENT: 'Creating tournament...',
      UPDATING_TOURNAMENT: 'Updating tournament...',
      DELETING_TOURNAMENT: 'Deleting tournament...',
      SAVING_SPORT: 'Saving sport...',
      DELETING_SPORT: 'Deleting sport...',
      LOADING_MATCH: 'Loading match...',
      STARTING_MATCH: 'Starting match...',
      PAUSING_MATCH: 'Pausing match...',
      ENDING_MATCH: 'Ending match...',
      RESETTING_MATCH: 'Resetting match...',
      UPDATING_SCORE: 'Updating score...',
      GENERATING_MATCHES: 'Generating matches...',
      ADVANCING_ROUND: 'Advancing to next round...',
      CREATING_MOCK_DATA: 'Creating mock data...'
    },
    CONFIRM: {
      DELETE_TOURNAMENT: 'Are you sure you want to delete "{name}"? This will delete all players, teams, and matches.',
      DELETE_SPORT: 'Delete sport "{name}"?',
      RESET_MATCH: 'Are you sure you want to reset this match? All progress will be lost.',
      CREATE_MOCK_DATA: 'Create mock tournament with players, teams, and matches?',
      REMOVE_PLAYER: 'Remove this player?',
      REMOVE_TEAM: 'Remove this team?'
    },
    VALIDATION: {
      MIN_TEAMS: 'Need at least 2 teams to generate matches',
      MIN_TEAMS_ADVANCE: 'Need at least 2 teams to advance from {stage}',
      MIN_WINNERS: 'Need at least 2 winners from {stage}',
      DIFFERENT_TEAMS: 'Please select different teams',
      DUPLICATE_PLAYER: 'Player name already exists!',
      SAVE_TOURNAMENT_FIRST: 'Please save the tournament first',
      TOURNAMENT_COMPLETE: 'Tournament is already complete!'
    }
  }
};

export const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

export const STEP_LABELS = {
  1: 'Basic Details',
  2: 'Players', 
  3: 'Teams',
  4: 'Matches',
  5: 'Review'
};