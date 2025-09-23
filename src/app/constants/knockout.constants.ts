/**
 * Knockout Tournament Constants
 * Centralized constants for knockout tournament functionality
 */

export const KNOCKOUT_CONSTANTS = {
  // Labels and Text
  LABELS: {
    KNOCKOUT_TOURNAMENT: 'Knockout Tournament',
    TOURNAMENT_INFO: 'Tournament Info',
    STATUS: 'Status',
    TEAMS: 'Teams',
    TOTAL_MATCHES: 'Total Matches',
    GENERATE_MATCHES: 'Generate Group Stage Matches',
    ADVANCE_TO: 'Advance to',
    FINAL_SCORE: 'Final Score',
    WINNER: 'Winner',
    DRAW: 'Draw',
    PENDING: 'Pending',
  },

  // Status values
  STATUS: {
    COMPLETE: 'Complete',
    IN_PROGRESS: 'In Progress',
    PENDING: 'Pending',
    FINISHED: 'finished',
  },

  // Colors for different states
  COLORS: {
    SUCCESS: 'success',
    WARNING: 'warning',
    MEDIUM: 'medium',
    PRIMARY: 'primary',
    DANGER: 'danger',
  },

  // Icons
  ICONS: {
    REFRESH: 'refresh-outline',
    PLAY: 'play-outline',
  },

  // CSS Classes
  CSS_CLASSES: {
    TOURNAMENT_INFO_CARD: 'tournament-info-card',
    TOURNAMENT_INFO_HEADER: 'tournament-info-header',
    TOURNAMENT_INFO_CONTENT: 'tournament-info-content',
    STAGE_CARD: 'stage-card',
    STAGE_HEADER: 'stage-header',
    STAGE_TITLE: 'stage-title',
    STAGE_STATUS_CHIP: 'stage-status-chip',
    STAGE_CONTENT: 'stage-content',
    MATCHES_LIST: 'matches-list',
    MATCH_ITEM: 'match-item',
    MATCH_LABEL: 'match-label',
    MATCH_TITLE: 'match-title',
    MATCH_STATUS: 'match-status',
    MATCH_SCORE: 'match-score',
    MATCH_WINNER: 'match-winner',
    GENERATE_BUTTON: 'generate-button',
    ADVANCE_BUTTON: 'advance-button',
  },

  // Minimum requirements
  REQUIREMENTS: {
    MIN_TEAMS_FOR_MATCHES: 2,
    MIN_STAGE_INDEX: 0,
  },
} as const;