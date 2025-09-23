/**
 * UI Constants - Centralized configuration for all UI-related values
 * This file contains all hardcoded values used across the application
 */

export const UI_CONSTANTS = {
  // Spacing and Layout
  SPACING: {
    XS: '4px',
    SM: '8px',
    MD: '12px',
    LG: '16px',
    XL: '24px',
    XXL: '32px',
  },

  // Avatar sizes
  AVATAR: {
    SMALL: '32px',
    MEDIUM: '48px',
    LARGE: '64px',
  },

  // Margins and Padding
  MARGIN: {
    TOP_NEGATIVE_SM: '-12px',
    TOP_XS: '4px',
    TOP_SM: '8px',
    BOTTOM_SM: '10px',
    RIGHT_SM: '10px',
    LEFT_SM: '8px',
  },

  // Font sizes
  FONT_SIZE: {
    SMALL: '0.9rem',
    MEDIUM: '1rem',
    LARGE: '1.2rem',
  },

  // Component specific values
  SEGMENT: {
    PADDING_VERTICAL: '12px',
    PADDING_HORIZONTAL: '0',
  },

  // Modal and form values
  MODAL: {
    MAX_LENGTH: {
      TEAM_NAME: 50,
      PLAYER_NAME: 100,
    },
  },

  // Default URLs and fallbacks
  DEFAULTS: {
    AVATAR_URL: 'https://ionicframework.com/docs/img/demos/avatar.svg',
  },

  // Animation and transition values
  ANIMATION: {
    DURATION_FAST: '200ms',
    DURATION_NORMAL: '300ms',
    DURATION_SLOW: '500ms',
  },

  // Z-index values
  Z_INDEX: {
    MODAL: 1000,
    OVERLAY: 999,
    DROPDOWN: 100,
    TOOLTIP: 50,
  },

  // Breakpoints for responsive design
  BREAKPOINTS: {
    MOBILE: '576px',
    TABLET: '768px',
    DESKTOP: '992px',
    LARGE_DESKTOP: '1200px',
  },
} as const;

/**
 * CSS Class Names - Centralized class naming convention
 * All CSS classes should follow BEM methodology: block__element--modifier
 */
export const CSS_CLASSES = {
  // Layout classes
  LAYOUT: {
    FLEX_CENTER: 'layout__flex-center',
    FLEX_BETWEEN: 'layout__flex-between',
    FLEX_START: 'layout__flex-start',
    FLEX_END: 'layout__flex-end',
    FLEX_COLUMN: 'layout__flex-column',
    FLEX_ROW: 'layout__flex-row',
  },

  // Component specific classes
  SEGMENT: {
    CONTAINER: 'segment__container',
    BUTTON_CONTENT: 'segment__button-content',
    BADGE: 'segment__badge',
  },

  TEAM_MANAGEMENT: {
    PLAYER_AVATAR: 'team-management__player-avatar',
    METADATA_WRAPPER: 'team-management__metadata-wrapper',
    STATUS_CHIP: 'team-management__status-chip',
    DETAIL_CHIP: 'team-management__detail-chip',
    TEAM_TITLE: 'team-management__team-title',
    PLAYER_INFO: 'team-management__player-info',
    PLAYERS_TEXT: 'team-management__players-text',
    PLAYER_NAME: 'team-management__player-name',
    MORE_PLAYERS: 'team-management__more-players',
  },

  MODAL: {
    CONTAINER: 'modal__container',
    CONTENT: 'modal__content',
    ACTIONS: 'modal__actions',
    TITLE_ICON: 'modal__title-icon',
    SECTION_SUBTITLE: 'modal__section-subtitle',
    SUBTITLE_ICON: 'modal__subtitle-icon',
  },

  EMPTY_STATE: {
    CONTAINER: 'empty-state__container',
    ICON: 'empty-state__icon',
    MESSAGE: 'empty-state__message',
    WARNING: 'empty-state__warning',
  },

  BUTTONS: {
    ADD_TEAM: 'button__add-team',
    SAVE: 'button__save',
    CANCEL: 'button__cancel',
    ACTION_ROW: 'button__action-row',
  },

  SEARCH: {
    BAR: 'search__bar',
  },

  PLAYER_SELECTION: {
    LIST: 'player-selection__list',
    ITEM: 'player-selection__item',
    AVATAR_WRAPPER: 'player-selection__avatar-wrapper',
  },
} as const;

/**
 * Text and Message Constants
 */
export const TEXT_CONSTANTS = {
  PLACEHOLDERS: {
    SEARCH_PLAYERS: 'Search players by name or email',
    SEARCH_TEAMS: 'Search teams by name',
    TEAM_NAME: 'Enter team name',
  },

  LABELS: {
    TEAM_NAME: 'Team Name',
    SELECT_PLAYERS: 'Select Players',
    REGISTRATIONS: 'Registrations',
    TEAMS: 'Teams',
    PLAYERS: 'Players',
    PLAYER: 'player',
    PLAYERS_PLURAL: 'players',
    ACTIVE: 'Active',
    EMPTY: 'Empty',
    APPROVE: 'Approve',
    REJECT: 'Reject',
    DELETE: 'Delete',
    EDIT_TEAM: 'Edit Team',
    DELETE_TEAM: 'Delete Team',
    ADD_TEAM: 'Add Team',
    CREATE_TEAM: 'Create Team',
    UPDATE_TEAM: 'Update Team',
    CANCEL: 'Cancel',
    PLAYER_REGISTER: 'Player Register',
    TEAM_PREFIX: 'Team',
    PLAYERS_PREFIX: 'Players',
  },

  MESSAGES: {
    NO_PLAYERS_FOUND: 'No players found matching',
    NO_TEAMS_FOUND: 'No teams found matching',
    NO_REGISTRATIONS: 'No registration requests yet',
    NO_AVAILABLE_PLAYERS: 'No available players, All approved players are already assigned to teams',
  },

  STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  },
} as const;