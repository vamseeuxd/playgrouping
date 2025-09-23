/**
 * Tournament Component Constants
 * Centralized constants for tournament-related components
 */

export const TOURNAMENT_CONSTANTS = {
  // Display limits
  DISPLAY: {
    MAX_MATCHES_PREVIEW: 4,
    MAX_TEAM_NAME_LENGTH: 8,
    TEAM_AVATAR_SIZE: 'small',
  },

  // Text labels
  LABELS: {
    MATCHES: 'Matches',
    REGISTRATION_OPEN: 'Registration Open',
    REGISTRATION_CLOSED: 'Registration Closed',
    NO_MATCHES: 'No matches scheduled',
    MORE_MATCHES: 'more',
    TOURNAMENT_EDITORS: 'Tournament Editors',
    NO_EDITORS: 'No Editors',
    NO_EDITORS_MESSAGE: 'No editors have been assigned to this tournament yet.',
    APPROVED: 'Approved',
    PENDING: 'Pending',
    APPROVE: 'Approve',
    REMOVE: 'Remove',
    VS: 'VS',
  },

  // Action labels
  ACTIONS: {
    SCOREBOARD: 'Scoreboard',
    KNOCKOUT: 'Knockout',
    EDIT_TOURNAMENT: 'Edit Tournament',
    PRINT_QR: 'Print QR Code',
    CLOSE_REGISTRATION: 'Close Registration',
    OPEN_REGISTRATION: 'Open Registration',
    MANAGE_TEAMS: 'Manage Teams',
    REGISTER_AS_PLAYER: 'Register as Player',
    REQUEST_EDIT_ACCESS: 'Request Edit Access',
    MANAGE_EDITORS: 'Manage Editors',
    DELETE_TOURNAMENT: 'Delete Tournament',
  },

  // Status mappings
  STATUS: {
    ONGOING: 'ongoing',
    STARTED: 'started',
    SCHEDULED: 'scheduled',
    PENDING: 'pending',
    COMPLETED: 'completed',
    FINISHED: 'finished',
    CANCELLED: 'cancelled',
  },

  // Status display text
  STATUS_TEXT: {
    LIVE: 'Live',
    SCHEDULED: 'Scheduled',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  },

  // Icons
  ICONS: {
    TROPHY: 'trophy-outline',
    MENU: 'ellipsis-vertical-outline',
    CHEVRON_UP: 'chevron-up-outline',
    CHEVRON_DOWN: 'chevron-down-outline',
    CALENDAR: 'calendar-outline',
    CHECKMARK_CIRCLE: 'checkmark-circle-outline',
    STATS_CHART: 'stats-chart-outline',
    CREATE: 'create-outline',
    QR_CODE: 'qr-code-outline',
    LOCK_CLOSED: 'lock-closed-outline',
    LOCK_OPEN: 'lock-open-outline',
    PEOPLE: 'people-outline',
    PERSON_ADD: 'person-add-outline',
    MAIL: 'mail-outline',
    PEOPLE_CIRCLE: 'people-circle-outline',
    TRASH: 'trash-outline',
    CLOSE: 'close-outline',
    CHECKMARK: 'checkmark-outline',
    TIME: 'time-outline',
    ADD: 'add-outline',
  },

  // CSS Classes
  CSS_CLASSES: {
    TOURNAMENT_CARD: 'tournament-card',
    TOURNAMENT_CONTENT: 'tournament-content',
    TOURNAMENT_HEADER: 'tournament-header',
    TOURNAMENT_INFO: 'tournament-info',
    TOURNAMENT_NAME: 'tournament-name',
    TOURNAMENT_META: 'tournament-meta',
    SPORT_CHIP: 'sport-chip',
    MENU_BUTTON: 'menu-button',
    MATCHES_SECTION: 'matches-section',
    MATCHES_HEADER: 'matches-header',
    HEADER_ACTIONS: 'header-actions',
    EXPAND_ICON: 'expand-icon',
    MATCHES_GRID: 'matches-grid',
    MATCH_CARD: 'match-card',
    MATCH_TEAMS: 'match-teams',
    TEAM: 'team',
    TEAM_AVATAR: 'team-avatar',
    TEAM_NAME: 'team-name',
    VS_SEPARATOR: 'vs-separator',
    VS_TEXT: 'vs-text',
    MATCH_STATUS: 'match-status',
    STATUS_BADGE: 'status-badge',
    MORE_MATCHES: 'more-matches',
    VIEW_ALL_BTN: 'view-all-btn',
    NO_MATCHES: 'no-matches',
    NO_MATCHES_ICON: 'no-matches-icon',
    REGISTRATION_STATUS: 'registration-status',
    REGISTRATION_CHIP: 'registration-chip',
    POPOVER_CONTENT: 'popover-content',
    ACTION_LIST: 'action-list',
    DELETE_ITEM: 'delete-item',
    EDITORS_CONTENT: 'editors-content',
    EDITORS_LIST: 'editors-list',
    EDITOR_ITEM: 'editor-item',
    EDITOR_NAME: 'editor-name',
    EDITOR_EMAIL: 'editor-email',
    APPROVAL_CHIP: 'approval-chip',
    EMPTY_STATE: 'empty-state',
    EMPTY_ICON: 'empty-icon',
  },
} as const;